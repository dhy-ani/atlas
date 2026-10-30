# Atlas

A group trip planner where AI agents do the research and the negotiating, and every number on screen comes from a live source or is shown as unavailable.

Live: https://dhy-ani.github.io/atlas/ (static build) and the full-stack deployment on Vercel.

## Why this exists

Planning a trip with other people fails in two predictable ways. First, the research is scattered across a dozen tabs and goes stale. Second, the group never converges: one person wants museums and a budget hotel, another wants beaches and a splurge, and the compromise is whoever argues longest.

Most "AI trip planner" demos hide a third problem: they invent flight prices, weather and attractions from a hardcoded list or from model memory, so the output looks plausible and cannot be trusted. Atlas was built to prove the opposite approach is practical: agents that fetch real data, reason over it, and say "unavailable at the moment" when they cannot.

## What it does

- Personal atlas: each signed-in user builds their own list of destinations on a 3D satellite globe. New accounts start empty; nothing is pre-seeded or shared.
- Live climate: best time to visit is computed from five years of real ERA5 daily temperature and rainfall for the destination's coordinates (Open-Meteo, no API key).
- Live travel costs: a web-search agent reads current sources and returns budget-tier and luxury-tier flight and stay estimates with citations, evaluated against the traveler's own budget (slider in the UI).
- Group planning: members join with a code, each answers a structured survey, and a pipeline of agents produces one itinerary the whole group accepts.
- Honest empty states: if a source is down or not configured, the interface says the data is unavailable. There is no synthetic fallback anywhere in the request path.

## What makes it different

| Typical AI planner | Atlas |
|---|---|
| Prices, weather and POIs come from model memory or a bundled list | Every figure is fetched at request time from a named source and labeled with it |
| Failure is hidden by plausible filler | Failure is shown as "unavailable at the moment" |
| One model call produces one answer | Specialized agents with distinct roles check each other's work |
| Preferences are a text prompt | Each member is represented by a Digital Twin built from a 15-field structured survey |
| Cost grows with every interaction | Rule-based scoring first, LLM only for ambiguous scores, batched calls, response caching, and hard per-minute and per-day spend caps |

## Agents

One LangGraph pipeline coordinates five roles:

1. Digital Twins: one per member. Score any proposal against that member's profile, with rules first and an LLM only for scores in the ambiguous 55 to 89 range.
2. Research agent: LangChain plus Tavily web search. Finds real points of interest informed by the whole group's aggregated needs.
3. Planner agent: turns research into a budget-capped itinerary.
4. Negotiator agent: when a twin rejects a plan, decides which category caused the rejection and sends a directive back to research. It never picks the replacement itself.
5. Documentation agent: deterministic write-up of the negotiation record. No LLM call.

A separate live-data agent (`backend/app/agents/live_data_agent.py`) powers flight and cost comparison. Every function returns `status: ok | not_configured | error`.

## Data sources

| Feature | Source | Needs a key | When unavailable |
|---|---|---|---|
| Best time to visit | Open-Meteo ERA5 archive | No | "Data is unavailable at the moment." |
| Flight and cost comparison | Tavily search plus an LLM via OpenRouter | Yes | Same message |
| Place search | Google Places if keyed, otherwise OpenStreetMap Nominatim | Optional | Empty result with source `unavailable` |
| Group research | Tavily plus an LLM | Yes | HTTP 503 with the same message |
| Route distances | Great-circle geometry on user-supplied coordinates | No | Not applicable |

## Architecture

```
Browser (Vite, Three.js)
   |  JWT
   v
FastAPI  --  /api/atlas  /api/flights  /api/predict  /api/group  /api/negotiate
   |-- SQLAlchemy + Alembic --> Postgres (Neon) in production, SQLite locally
   |-- live_data_agent -------> Tavily search + OpenRouter LLM
   |-- climate_client --------> Open-Meteo ERA5
   '-- LangGraph pipeline ----> research / planner / twins / negotiator / documentation
```

Full diagrams and design rationale are in `docs/architecture-v2/`.

## Repository and release model

| Branch | Purpose |
|---|---|
| `main` | Production. Only receives reviewed pull requests from `develop`. |
| `develop` | Integration branch. All work lands here first. |
| `feature/*` | Short-lived branches cut from `develop`. |

Database schema changes ship as Alembic migrations in `backend/migrations`, reviewed like code and applied before a release is promoted.

## Run it locally

Requirements: Python 3.12, Node 20.

```bash
git clone https://github.com/dhy-ani/atlas.git
cd atlas

# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env                          # add keys to enable live travel costs
uvicorn app.main:app --reload --port 8000

# frontend (second terminal)
cd frontend
npm install
npm run dev                                         # http://localhost:5173
```

With no keys set, climate data and place search still work; flight and cost sections show as unavailable.

Optional: `docker compose up --build` runs the full stack in containers. See `docs/DOCKER.md`.

## Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Leave empty locally to use SQLite. |
| `JWT_SECRET` | Required in production. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `TAVILY_API_KEY`, `OPENROUTER_API_KEY` | Enable the live-data and research agents. |
| `GOOGLE_PLACES_API_KEY` | Optional richer place search. |

## Database

```bash
cd backend
alembic upgrade head        # apply migrations (Postgres in production)
alembic revision --autogenerate -m "describe the change"
```

Local SQLite and the test suite create tables automatically. Production databases are only changed through migrations.

## Tests

```bash
cd backend && pytest        # 92 tests, no network or keys required
```

Tests stand in for live research with fixtures that live under `backend/tests/fixtures` and are never shipped with the app.

## Tech

Python, FastAPI, SQLAlchemy, Alembic, Postgres, LangGraph, LangChain, Tavily, OpenRouter, JWT with bcrypt, JavaScript, Vite, Three.js, Leaflet, Docker, Vercel, GitHub Pages.

## Skills demonstrated

Agent orchestration and evaluation, cost-controlled LLM design, retrieval from live sources, honest failure handling, authentication, relational schema design and migrations, API design, CI-friendly testing, and production deployment on serverless infrastructure.
