"""Best-time-to-visit and a budget-vs-luxury comparison.

Best time is computed from real ERA5 climate data (free, keyless) and cached for
30 days since climate normals do not change. The budget comparison needs live
web search, so it is sign-in only, cached, rate limited, and its budget is
snapped to $250 buckets so moving a slider reuses cached answers."""
from fastapi import APIRouter, Depends, Query

from app.agents import live_data_agent
from app.auth import get_current_user
from app.db.models import User
from app.services import api_cache, climate_client

router = APIRouter(prefix="/api/predict", tags=["predict"])


@router.get("/best-time")
async def best_time(
    destination_name: str = Query(...),
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
):
    key = api_cache.make_key("climate", round(lat, 1), round(lng, 1))  # ~11 km grid
    months = (api_cache.get(key) or {}).get("months")
    if months is None:
        months = await climate_client.monthly_normals(lat, lng)
        if months is None:
            return {"status": "error", "destination": destination_name,
                    "message": "Climate data is unavailable at the moment."}
        api_cache.put(key, {"months": months}, api_cache.TTL_OK["climate"])
    ranked = sorted(months, key=lambda m: -m["comfort_score"])
    return {
        "status": "ok", "destination": destination_name, "source": "open-meteo-era5",
        "months": months, "best_months": [m["month_name"] for m in ranked[:3]],
        "avoid_months": [m["month_name"] for m in ranked[-2:]],
    }


@router.get("/tradeoff")
def tradeoff(
    destination_name: str = Query(...),
    destination_country: str = Query(""),
    budget_usd: float = Query(..., ge=0, description="the traveler's total trip budget"),
    user: User = Depends(get_current_user),
):
    bucket = api_cache.budget_bucket(budget_usd)
    key = api_cache.make_key("tradeoff", destination_name, destination_country, bucket)
    return api_cache.paid_call(
        user.id, "tradeoff", key,
        lambda: live_data_agent.search_tradeoff(destination_name, destination_country, bucket))
