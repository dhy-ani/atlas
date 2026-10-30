"""Smoke tests — run `pytest` from the backend/ dir. No TAVILY_API_KEY/
OPENROUTER_API_KEY are configured in CI, so flights/best-time/trade-off should
consistently report status="not_configured" rather than fabricate numbers —
that IS the behavior under test, not a skip condition."""
from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _signup(email="atlastest@example.com", password="testpass123", name="Atlas Test"):
    r = client.post("/api/auth/signup", json={"email": email, "password": password, "name": name})
    assert r.status_code == 201, r.text
    return r.json()["token"]


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["live"]["live_data_agent"] is False  # no keys configured in tests


def test_atlas_requires_auth():
    assert client.get("/api/atlas").status_code == 401


def test_new_user_starts_with_empty_atlas():
    token = _signup(email="fresh_user@example.com")
    r = client.get("/api/atlas", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json() == []  # no seed/shared data for anyone -- every account starts empty


def test_add_and_remove_atlas_destination():
    token = _signup(email="atlas_add_test@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    r = client.post("/api/atlas", json={"name": "Test Place", "lat": 48.0, "lng": 2.0}, headers=headers)
    assert r.status_code == 201
    d = r.json()
    assert d["custom"] is True
    dest_key = d["id"]
    assert any(x["id"] == dest_key for x in client.get("/api/atlas", headers=headers).json())
    assert client.delete(f"/api/atlas/{dest_key}", headers=headers).status_code == 200
    assert all(x["id"] != dest_key for x in client.get("/api/atlas", headers=headers).json())


def test_flights_not_configured_without_keys():
    r = client.get("/api/flights", params={"destination_name": "Paris", "destination_country": "France"})
    assert r.status_code == 200
    assert r.json()["status"] == "not_configured"


def _fake_months():
    return [{"month": m, "month_name": n, "avg_temp_c": 10.0 + m, "rain_mm": 50.0, "comfort_score": 40.0 + m}
            for m, n in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)]


def test_best_time_uses_real_climate_data(monkeypatch):
    async def fake(lat, lng):
        return _fake_months()
    monkeypatch.setattr("app.routers.predictions.climate_client.monthly_normals", fake)
    r = client.get("/api/predict/best-time", params={"destination_name": "Rio", "lat": -22.9, "lng": -43.2})
    body = r.json()
    assert body["status"] == "ok" and body["source"] == "open-meteo-era5"
    assert body["best_months"] == ["Dec", "Nov", "Oct"]


def test_best_time_unavailable_when_upstream_fails(monkeypatch):
    async def fake(lat, lng):
        return None
    monkeypatch.setattr("app.routers.predictions.climate_client.monthly_normals", fake)
    r = client.get("/api/predict/best-time", params={"destination_name": "Rio", "lat": -22.9, "lng": -43.2})
    assert r.json()["status"] == "error"


def test_tradeoff_not_configured_without_keys():
    r = client.get("/api/predict/tradeoff", params={"destination_name": "Tokyo", "budget_usd": 2000})
    assert r.status_code == 200
    assert r.json()["status"] == "not_configured"


def test_route_plan():
    depart = (date.today() + timedelta(days=30)).isoformat()  # unused, keeps import
    payload = {
        "stops": [
            {"name": "Paris", "lat": 48.85, "lng": 2.35},
            {"name": "Tokyo", "lat": 35.68, "lng": 139.65},
        ],
        "optimize": False,
    }
    r = client.post("/api/routes/plan", json=payload)
    assert r.status_code == 200
    assert r.json()["total_distance_km"] > 0
    assert len(r.json()["legs"]) == 1
