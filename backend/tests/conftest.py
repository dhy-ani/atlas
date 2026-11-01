"""Test-wide fixtures. Most importantly: the entire test suite must be provably
correct and $0-cost regardless of what's in the local/CI .env file — a real
OPENROUTER_API_KEY being present (e.g. for manual live-verification) must never
cause routine `pytest` runs to silently make real, billed API calls. This
autouse fixture forces `llm_client.has_llm()` to False for every test unless a
test explicitly opts back in via `monkeypatch.setattr(llm_client, "has_llm", ...)`
after this fixture runs.

Also points DATABASE_URL at a throwaway SQLite file so tests never touch the
real backend/data/app.db — must happen before ANYTHING imports app.db.engine
(which reads DATABASE_URL at import time), hence doing it at module scope here,
since pytest always imports conftest.py before any test module in this dir.
"""
import os
from pathlib import Path

_TEST_DB = Path(__file__).resolve().parents[1] / "data" / "test_app.db"
_TEST_DB.parent.mkdir(parents=True, exist_ok=True)
if _TEST_DB.exists():
    _TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"

import pytest  # noqa: E402

from app.agents import llm_client  # noqa: E402
from app.db.engine import init_db  # noqa: E402

init_db()


@pytest.fixture(autouse=True)
def no_real_llm_calls_in_tests(monkeypatch):
    monkeypatch.setattr(llm_client, "has_llm", lambda: False)


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """Signs up a fresh, unique test user and returns Authorization headers."""
    import secrets

    email = f"test-{secrets.token_hex(6)}@example.com"
    resp = client.post("/api/auth/signup", json={"email": email, "password": "password123", "name": "Test User"})
    assert resp.status_code == 201, resp.text
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}


import json as _json
from pathlib import Path as _Path

import pytest as _pytest

_POI_FIXTURES = _json.loads((_Path(__file__).parent / "fixtures" / "poi_fixtures.json").read_text(encoding="utf-8"))


@_pytest.fixture(autouse=True)
def _fixture_research(monkeypatch):
    """Stands in for live web research in tests (no network, no keys). Fixture
    data lives only under tests/ and is never shipped or displayed by the app."""
    from app.agents import research_agent

    def fake(destination_id, destination_name, needs, avoid_categories=None):
        avoid = set(avoid_categories or [])
        pois = [p for p in _POI_FIXTURES.get(destination_id, []) if p.get("category") not in avoid]
        return pois, ("web" if pois else "unavailable")

    monkeypatch.setattr(research_agent, "research_pois", fake)


@_pytest.fixture(autouse=True)
def _no_paid_keys(monkeypatch):
    """Tests must never spend money: remove live-data keys even if a developer's
    local .env has real ones."""
    for name in ("TAVILY_API_KEY", "OPENROUTER_API_KEY"):
        monkeypatch.delenv(name, raising=False)
