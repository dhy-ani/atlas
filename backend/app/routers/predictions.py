"""Best-time-to-visit and a budget-vs-luxury comparison.

Best time is computed from real ERA5 climate data (keyless, Open-Meteo) and,
when search keys are configured, enriched with a sourced narrative from the
live-data agent. Budget-vs-luxury needs live web search; without it the
response says so rather than estimating."""
from fastapi import APIRouter, Query

from app.agents import live_data_agent
from app.services import climate_client

router = APIRouter(prefix="/api/predict", tags=["predict"])


@router.get("/best-time")
async def best_time(
    destination_name: str = Query(...),
    destination_country: str = Query(""),
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
):
    months = await climate_client.monthly_normals(lat, lng)
    if months is None:
        return {"status": "error", "destination": destination_name,
                "message": "Climate data is unavailable at the moment."}
    ranked = sorted(months, key=lambda m: -m["comfort_score"])
    result = {
        "status": "ok", "destination": destination_name, "source": "open-meteo-era5",
        "months": months, "best_months": [m["month_name"] for m in ranked[:3]],
        "avoid_months": [m["month_name"] for m in ranked[-2:]],
    }
    if live_data_agent.is_configured():
        extra = live_data_agent.search_best_time(destination_name, destination_country)
        if extra.get("status") == "ok":
            result["narrative"] = extra.get("narrative", "")
            result["sources"] = extra.get("sources", [])
    return result


@router.get("/tradeoff")
async def tradeoff(
    destination_name: str = Query(...),
    destination_country: str = Query(""),
    budget_usd: float = Query(..., ge=0, description="the traveler's total trip budget"),
):
    return live_data_agent.search_tradeoff(destination_name, destination_country, budget_usd)
