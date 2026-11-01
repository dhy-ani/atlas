"""Database engine. One codebase, two modes:

  - Local / Docker (default): SQLite file at data/app.db — zero setup, matches
    the rest of this app's "runs with nothing configured" philosophy.
  - Vercel (or any host with DATABASE_URL set): a real Postgres connection —
    required because serverless functions have an ephemeral filesystem, so a
    SQLite file wouldn't survive between invocations. Vercel Postgres/Neon both
    hand you a `postgresql://...` URL that drops straight into DATABASE_URL.

This replaces the JSON-file storage the group/survey/destinations features used
before (backend/app/agents/storage.py, services/destinations.py's custom
registry) with real relational tables — needed once "sign in" means a real
account instead of a name typed into a box.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import ENV_PATH

# Self-loading (not just relying on app.config having run first) — same reason
# as agents/llm_client.py: DATABASE_URL is read at import time below, so it must
# not silently miss .env just because something imported this module first.
load_dotenv(ENV_PATH, override=False)


def _database_url() -> str:
    # ATLAS_DATABASE_URL is this project's own database; DATABASE_URL is the
    # generic name (and what hosting integrations inject), used as a fallback.
    url = os.environ.get("ATLAS_DATABASE_URL") or os.environ.get("DATABASE_URL", "")
    if url:
        # Vercel Postgres/Neon sometimes hand out "postgres://"; SQLAlchemy's
        # psycopg driver wants the "postgresql://" scheme.
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    db_path = Path(__file__).resolve().parents[2] / "data" / "app.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{db_path}"


DATABASE_URL_SOURCE = (
    "ATLAS_DATABASE_URL" if os.environ.get("ATLAS_DATABASE_URL")
    else "DATABASE_URL" if os.environ.get("DATABASE_URL") else "local-sqlite"
)
DATABASE_URL = _database_url()
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
    pool_pre_ping=not IS_SQLITE,  # serverless Postgres connections can go stale between invocations
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: one session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Schema is owned by Alembic (backend/migrations). Run `alembic upgrade head`
    before starting the app. For local SQLite and the test suite only, tables are
    created automatically so a fresh checkout works with zero setup."""
    from app.db import models  # noqa: F401  (registers models on Base.metadata)
    if IS_SQLITE:
        Base.metadata.create_all(bind=engine)
