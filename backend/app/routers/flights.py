"""Flight prices -- real web-search-derived data only, behind sign-in, a shared
cache and a per-user rate limit (see services/api_cache.py). No mock fallback:
if the search keys aren't configured or the search comes up empty, the response
status says so and the frontend shows the data as unavailable."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query

from app.agents import live_data_agent
from app.auth import get_current_user
from app.db.models import User
from app.services import api_cache

router = APIRouter(prefix="/api/flights", tags=["flights"])

_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("")
def flights(
    destination_name: str = Query(..., description="destination name, e.g. 'Paris'"),
    destination_country: str = Query("", description="destination country/region, for search accuracy"),
    origin: str = Query("JFK", pattern="^(JFK|EWR)$"),
    depart: str | None = Query(None, description="YYYY-MM-DD; defaults to 60 days out"),
    user: User = Depends(get_current_user),
):
    depart_date = date.fromisoformat(depart) if depart else date.today() + timedelta(days=60)
    month = _MONTHS[depart_date.month - 1]  # prices are cached per month, not per exact day
    key = api_cache.make_key("flights", origin, destination_name, destination_country, month)
    return api_cache.paid_call(
        user.id, "flights", key,
        lambda: live_data_agent.search_flight_prices(origin, destination_name, destination_country, month))
