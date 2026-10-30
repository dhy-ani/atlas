"""Web-search agent: a "what's trending/worth seeing" signal sourced from Reddit's
public JSON API (no auth needed for read-only search — no login, no app
registration). This is deliberately NOT Instagram: Instagram has no public API for
third-party location/hashtag search, so pulling its content means scraping against
their Terms of Service — fragile (breaks on every layout change), gets IPs
blocked, and carries real legal exposure. Reddit's search is a legitimate,
documented, stable alternative for the same "what do real travelers say is worth
seeing" signal.

Results are cached (cache.py) since the same destination gets asked about
repeatedly across negotiations — no point re-hitting Reddit every time.
"""
from __future__ import annotations

import re
from collections import defaultdict

import httpx

from app.agents import cache

REDDIT_SEARCH_URL = "https://www.reddit.com/search.json"
# Reddit blocks generic/default User-Agents outright — a descriptive one is required.
HEADERS = {"User-Agent": "atlas-trip-planner/1.0 (by /u/wanderlust-atlas-app)"}
CACHE_TTL_PURPOSE = "reddit_trending"


def _fetch_posts(query: str, limit: int = 25) -> list[dict]:
    try:
        resp = httpx.get(
            REDDIT_SEARCH_URL,
            params={"q": query, "sort": "top", "t": "year", "limit": limit},
            headers=HEADERS, timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("data", {}).get("children", [])
    except Exception as exc:
        print(f"[reddit] search failed, trending signal will be flat: {exc}")
        return []


def trending_scores(destination_name: str, poi_names: list[str]) -> dict[str, float]:
    """Returns {poi_name: score in [0,1]} — how often/positively each POI is
    mentioned in recent top posts about the destination. All-zero (not an error)
    if Reddit is unreachable, so callers just get "no trending boost", never a
    crash — same graceful-degrade pattern as every other integration here."""
    if not poi_names:
        return {}

    key = cache.cache_key(model="reddit", purpose=CACHE_TTL_PURPOSE, payload={"dest": destination_name, "pois": sorted(poi_names)})
    cached = cache.get(key)
    if cached is not None:
        return cached

    posts = _fetch_posts(f"{destination_name} travel")
    mention_weight: dict[str, float] = defaultdict(float)
    for post in posts:
        data = post.get("data", {})
        text = f"{data.get('title', '')} {data.get('selftext', '')}".lower()
        upvotes = max(data.get("ups", 0), 0)
        for name in poi_names:
            # match on the POI's significant words (drop short connector words) so
            # "Eiffel Tower" still matches a post that just says "the Eiffel Tower views"
            words = [w for w in re.findall(r"[a-z]+", name.lower()) if len(w) > 3]
            if words and all(w in text for w in words):
                mention_weight[name] += 1 + (upvotes / 100.0)

    if not mention_weight:
        result = {name: 0.0 for name in poi_names}
    else:
        peak = max(mention_weight.values())
        result = {name: round(mention_weight.get(name, 0.0) / peak, 3) for name in poi_names}

    cache.put(key, result)
    return result
