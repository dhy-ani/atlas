"""Cache, single-flight and per-user rate limiting for paid upstream calls.

Every request to Tavily or an LLM costs money, so the order of operations is
fixed and cheap-first:

  1. shared cache hit       -> return it, free, nothing recorded
  2. single-flight          -> identical concurrent requests wait for one call
  3. per-user rate limit    -> 429 once the hourly or daily cap is reached
  4. the upstream call      -> recorded against the user, result cached

Successful results are cached for hours; failures are cached for a few minutes
so a down upstream is not hammered. Entries live in the main database, so every
serverless instance shares them.
"""
from __future__ import annotations

import os
import threading
from datetime import datetime, timedelta, timezone
from typing import Callable

from fastapi import HTTPException
from sqlalchemy import func

from app.db.engine import SessionLocal
from app.db.models import ApiCache, ApiUsage

HOUR = 3600
TTL_OK = {"flights": 12 * HOUR, "tradeoff": 12 * HOUR, "climate": 30 * 24 * HOUR}
TTL_FAILED = 5 * 60
BUDGET_BUCKET_USD = 250

_locks: dict[str, threading.Lock] = {}
_locks_guard = threading.Lock()


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _limits() -> tuple[int, int]:
    return (int(os.environ.get("PAID_CALLS_PER_USER_PER_HOUR", "20")),
            int(os.environ.get("PAID_CALLS_PER_USER_PER_DAY", "100")))


def make_key(kind: str, *parts) -> str:
    return "|".join([kind, *[str(p).strip().lower() for p in parts]])[:300]


def budget_bucket(budget_usd: float) -> int:
    """Snap a budget to the nearest $250 so slider movement reuses cached answers."""
    return max(BUDGET_BUCKET_USD, int(round(budget_usd / BUDGET_BUCKET_USD)) * BUDGET_BUCKET_USD)


def get(key: str) -> dict | None:
    with SessionLocal() as db:
        row = db.get(ApiCache, key)
        if row is None or row.expires_at <= _now():
            return None
        return row.payload


def put(key: str, payload: dict, ttl_seconds: int) -> None:
    with SessionLocal() as db:
        row = db.get(ApiCache, key)
        expires = _now() + timedelta(seconds=ttl_seconds)
        if row is None:
            db.add(ApiCache(key=key, payload=payload, expires_at=expires))
        else:
            row.payload, row.expires_at, row.created_at = payload, expires, _now()
        db.commit()


def _enforce_limit(user_id: int) -> None:
    per_hour, per_day = _limits()
    with SessionLocal() as db:
        def count(window: timedelta) -> int:
            return db.query(func.count(ApiUsage.id)).filter(
                ApiUsage.user_id == user_id, ApiUsage.created_at >= _now() - window).scalar() or 0
        if count(timedelta(hours=1)) >= per_hour:
            raise HTTPException(429, "Live price lookups are limited to %d per hour. Try again later." % per_hour)
        if count(timedelta(days=1)) >= per_day:
            raise HTTPException(429, "Daily limit for live price lookups reached. Try again tomorrow.")


def _record(user_id: int, kind: str) -> None:
    with SessionLocal() as db:
        db.add(ApiUsage(user_id=user_id, kind=kind))
        db.commit()


def paid_call(user_id: int, kind: str, key: str, fn: Callable[[], dict]) -> dict:
    cached = get(key)
    if cached is not None:
        return {**cached, "cached": True}

    with _locks_guard:
        lock = _locks.setdefault(key, threading.Lock())
    with lock:
        cached = get(key)  # another request may have filled it while we waited
        if cached is not None:
            return {**cached, "cached": True}
        _enforce_limit(user_id)
        result = fn()
        if result.get("status") == "not_configured":
            return result  # no upstream call was made, so nothing to charge or cache
        _record(user_id, kind)
        put(key, result, TTL_OK[kind] if result.get("status") == "ok" else TTL_FAILED)
        return {**result, "cached": False}
