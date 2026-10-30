# Setup & API keys

The app runs with **zero keys** (mock/keyless fallbacks). Add keys to switch each
feature to live data. Backend keys go in the repo-root `.env`; the one browser key
goes in `frontend/.env`.

## 0. Prerequisites
- Python 3.10+ and Node 18+

## 1. First run (no keys)

```bash
# backend
cd backend
python -m venv .venv && .venv\Scripts\activate        # (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python -m app.ml.train                                # train the price model (~2s)
uvicorn app.main:app --reload --port 8000

# frontend (second terminal)
cd frontend
npm install
npm run dev                                           # http://localhost:5173
```

The header shows which integrations are live, e.g. `flights·demo · weather·model · places·osm`.

## 2. Add live integrations

Copy `.env.example` → `.env` (repo root) and fill any of these:

### Flights — Amadeus (free sandbox)
1. Sign up at <https://developers.amadeus.com>.
2. Create an app → copy **API Key** and **API Secret**.
3. Set `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`. Keep `AMADEUS_ENV=test` for the
   free sandbox (limited routes/dates); switch to `production` once you add a paid plan.

### Weather — OpenWeather (free tier)
1. Sign up at <https://openweathermap.org/api> → **API keys**.
2. Set `OPENWEATHER_API_KEY`. This calibrates the current month with a live reading;
   the 12-month curve stays model-based unless you upgrade to the paid climate endpoint.

### Places — Google Places (server key)
1. Google Cloud Console → enable **Places API**.
2. Create an API key, restrict it to your server IP.
3. Set `GOOGLE_PLACES_API_KEY`. Without it, place search uses keyless OSM/Nominatim.

### Map, Satellite & Street View — Google Maps (browser key)
1. Google Cloud Console → enable **Maps JavaScript API**.
2. Create an API key, restrict it to `http://localhost:5173/*` (and your prod domain).
3. Put it in `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`.
   Without it the 2D map falls back to keyless Leaflet + Esri satellite tiles and
   **Street View is unavailable** (the button is hidden).

> Google Maps and Places require a billing account (they include a monthly free
> credit). Amadeus and OpenWeather have genuinely free tiers.

## 3. Force mock data
Set `USE_MOCK_DATA=true` in `.env` to ignore all backend keys — handy for offline dev
or deterministic demos.

## 4. Tests
```bash
cd backend && pytest
```
