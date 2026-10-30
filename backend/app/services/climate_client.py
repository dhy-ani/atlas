"""Real monthly climate normals from Open-Meteo's ERA5 archive (keyless).

Nothing here is modeled or hardcoded: we fetch five full years of daily mean
temperature and precipitation for the destination's coordinates and aggregate
by calendar month. If the upstream call fails, callers get None and report the
data as unavailable.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date

import httpx

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
YEARS = 5
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _comfort(avg_temp_c: float, rain_mm: float) -> float:
    """0-100 score derived from the real averages: peaks near 22 C, penalizes rain."""
    score = 100 - abs(avg_temp_c - 22) * 3.2 - rain_mm * 0.18
    return round(max(0.0, min(100.0, score)), 1)


async def monthly_normals(lat: float, lng: float) -> list[dict] | None:
    end_year = date.today().year - 1
    start_year = end_year - YEARS + 1
    params = {
        "latitude": lat, "longitude": lng,
        "start_date": f"{start_year}-01-01", "end_date": f"{end_year}-12-31",
        "daily": "temperature_2m_mean,precipitation_sum", "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            r = await client.get(ARCHIVE_URL, params=params)
            r.raise_for_status()
            daily = r.json()["daily"]
    except Exception as exc:
        print(f"[climate] open-meteo failed: {exc}")
        return None

    temps, rain = defaultdict(list), defaultdict(float)
    for day, t, p in zip(daily["time"], daily["temperature_2m_mean"], daily["precipitation_sum"]):
        month = int(day[5:7])
        if t is not None:
            temps[month].append(t)
        if p is not None:
            rain[month] += p
    if len(temps) < 12:
        return None

    out = []
    for m in range(1, 13):
        avg_t = sum(temps[m]) / len(temps[m])
        monthly_rain = rain[m] / YEARS
        out.append({
            "month": m, "month_name": MONTHS[m - 1],
            "avg_temp_c": round(avg_t, 1), "rain_mm": round(monthly_rain, 0),
            "comfort_score": _comfort(avg_t, monthly_rain),
        })
    return out
