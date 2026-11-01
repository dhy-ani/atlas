"""Cost controls for paid upstream calls: shared cache, negative caching,
budget bucketing and the per-user rate limit."""
import uuid

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.services import api_cache

client = TestClient(app)


def _user_id() -> int:
    email = f"cache_{uuid.uuid4().hex[:8]}@example.com"
    r = client.post("/api/auth/signup", json={"email": email, "password": "testpass123", "name": "Cache Test"})
    return r.json()["user"]["id"]


def _key(label: str) -> str:
    return api_cache.make_key("flights", label, uuid.uuid4().hex)


def test_second_identical_call_is_served_from_cache():
    uid, key, calls = _user_id(), _key("hit"), []
    fn = lambda: calls.append(1) or {"status": "ok", "price": 300}
    first = api_cache.paid_call(uid, "flights", key, fn)
    second = api_cache.paid_call(uid, "flights", key, fn)
    assert len(calls) == 1
    assert first["cached"] is False and second["cached"] is True and second["price"] == 300


def test_not_configured_is_never_cached_or_charged():
    uid, key, calls = _user_id(), _key("nc"), []
    fn = lambda: calls.append(1) or {"status": "not_configured"}
    api_cache.paid_call(uid, "flights", key, fn)
    api_cache.paid_call(uid, "flights", key, fn)
    assert len(calls) == 2  # nothing stored, so the (free) check runs again


def test_failures_are_cached_briefly_so_a_down_upstream_is_not_hammered():
    uid, key, calls = _user_id(), _key("err"), []
    fn = lambda: calls.append(1) or {"status": "error"}
    api_cache.paid_call(uid, "flights", key, fn)
    again = api_cache.paid_call(uid, "flights", key, fn)
    assert len(calls) == 1 and again["cached"] is True


def test_per_user_hourly_limit_returns_429(monkeypatch):
    monkeypatch.setenv("PAID_CALLS_PER_USER_PER_HOUR", "2")
    uid = _user_id()
    for i in range(2):
        api_cache.paid_call(uid, "flights", _key(f"lim{i}"), lambda: {"status": "ok"})
    with pytest.raises(HTTPException) as exc:
        api_cache.paid_call(uid, "flights", _key("lim-over"), lambda: {"status": "ok"})
    assert exc.value.status_code == 429


def test_cache_hits_do_not_count_toward_the_limit(monkeypatch):
    monkeypatch.setenv("PAID_CALLS_PER_USER_PER_HOUR", "1")
    uid, key = _user_id(), _key("free")
    for _ in range(5):
        api_cache.paid_call(uid, "flights", key, lambda: {"status": "ok"})  # one real call, four hits


@pytest.mark.parametrize("budget,expected", [(0, 250), (1000, 1000), (1100, 1000), (1130, 1250), (9999, 10000)])
def test_budget_is_snapped_to_buckets(budget, expected):
    assert api_cache.budget_bucket(budget) == expected


def test_paid_endpoints_require_sign_in():
    assert client.get("/api/flights", params={"destination_name": "Paris"}).status_code == 401
    assert client.get("/api/predict/tradeoff", params={"destination_name": "Paris", "budget_usd": 1000}).status_code == 401
