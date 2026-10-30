# Backend — Atlas API

FastAPI service: real accounts (JWT), a per-user atlas, live web-search-derived
flights/best-time/budget-vs-luxury data, place search, route planning, and the
multi-agent group trip planner. There is no offline mock/demo data path —
every live-data endpoint reports `status: "not_configured"` or `"error"`
honestly when it has no real source to draw from, instead of fabricating
numbers.

## Run

```bash
python -m venv .venv && .venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs: **http://localhost:8000/docs**

Set `TAVILY_API_KEY` + `OPENROUTER_API_KEY` in the repo-root `.env` to turn on
real flight/best-time/trade-off data and the group-planning research agent —
see `agents/live_data_agent.py`.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | which live integrations are active |
| GET/POST/DELETE | `/api/atlas` | the signed-in user's personal destination list (auth required) |
| GET | `/api/flights?destination_name=&origin=JFK` | live, web-search-derived budget vs. luxury flight estimate |
| GET | `/api/predict/best-time?destination_name=` | live, web-search-derived best-time-to-visit |
| GET | `/api/predict/tradeoff?destination_name=&budget_usd=` | budget-vs-luxury trip cost comparison |
| GET | `/api/places/search?lat=&lng=&q=` | nearby / free-text place search (Google Places, else keyless Nominatim) |
| POST | `/api/routes/plan` | route legs & totals for dashed globe lines (pure geometry) |
| `/api/auth/*`, `/api/group/*`, `/api/negotiate/*`, `/api/research/*` | accounts + multi-agent group trip planning |

## Layout

```
app/
├── main.py         app assembly + CORS + /api/health
├── config.py       .env-driven settings
├── models/         pydantic request/response schemas
├── routers/        one file per feature (thin HTTP layer)
├── agents/
│   ├── live_data_agent.py   flights/best-time/trade-off — Tavily + LLM, real data only
│   └── ...                  group-planning multi-agent pipeline (mediator, research, graphrag)
├── services/
│   ├── places_client.py     Google Places, else keyless real Nominatim
│   └── destinations.py      legacy registry used only by the group-planning pipeline
└── db/             SQLAlchemy models (User, UserDestination, Group, ...)
```

## Tests

```bash
pytest            # runs with no API keys; asserts live-data endpoints report "not_configured" honestly
```
