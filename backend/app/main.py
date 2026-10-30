"""Atlas API.

Run:  uvicorn app.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents import live_data_agent
from app.config import get_settings
from app.db.engine import init_db
from app.routers import (
    atlas, auth, availability, flights, group, negotiate, places,
    predictions, research, routes, survey, wishlist,
)

settings = get_settings()


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Atlas API",
    version="1.0.0",
    description="Real accounts, a personal atlas, live web-sourced flight/best-time/trade-off data, places, routes, and multi-agent group trip planning.",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(atlas.router)
app.include_router(flights.router)
app.include_router(places.router)
app.include_router(predictions.router)
app.include_router(routes.router)
app.include_router(auth.router)
app.include_router(group.router)
app.include_router(wishlist.router)
app.include_router(availability.router)
app.include_router(survey.router)
app.include_router(negotiate.router)
app.include_router(research.router)


@app.get("/api/health")
def health():
    """Handy for the frontend to show which live integrations are active."""
    return {
        "status": "ok",
        "live": {
            "live_data_agent": live_data_agent.is_configured(),
            "places_google": settings.has_places,
        },
    }
