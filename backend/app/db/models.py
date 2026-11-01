"""SQLAlchemy models: real user accounts + group collaboration data. Replaces
the JSON-file storage in app/agents/storage.py (kept there as-is for the
still-JSON-backed pieces like end surveys, but groups/identities/wishlist now
live here so they're real, queryable, multi-user, and Postgres-portable)."""
from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.engine import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    memberships: Mapped[list["GroupMember"]] = relationship(back_populates="user")


class Group(Base):
    __tablename__ = "groups"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    admin_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    members: Mapped[list["GroupMember"]] = relationship(back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_user"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    group: Mapped["Group"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")


class Identity(Base):
    """A member's Digital Twin preferences within one group — the DB-backed
    replacement for agents/storage.py's JSON-file IdentityVector records."""
    __tablename__ = "identities"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_identity_group_user"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    budget_min: Mapped[float] = mapped_column(default=0)
    budget_max: Mapped[float] = mapped_column(default=3000)
    pace: Mapped[str] = mapped_column(String(20), default="balanced")
    likes: Mapped[list] = mapped_column(JSON, default=list)
    dislikes: Mapped[list] = mapped_column(JSON, default=list)
    hard_constraints: Mapped[list] = mapped_column(JSON, default=list)
    # --- richer personalization ---
    accommodation_style: Mapped[str] = mapped_column(String(20), default="any")
    food_preferences: Mapped[list] = mapped_column(JSON, default=list)
    must_see: Mapped[list] = mapped_column(JSON, default=list)
    avoid: Mapped[list] = mapped_column(JSON, default=list)
    chronotype: Mapped[str] = mapped_column(String(20), default="flexible")
    transportation_pref: Mapped[str] = mapped_column(String(20), default="any")
    trip_priority: Mapped[str] = mapped_column(String(20), default="mixed")
    accessibility_needs: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    version: Mapped[int] = mapped_column(default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)


class UserDestination(Base):
    """One destination in ONE user's personal atlas — replaces the old global,
    unauthenticated `destinations.json` + `custom_destinations.json` file store.
    Every user's globe starts empty except a one-time seed for the original
    account (see routers/atlas.py); nothing here is shared between accounts."""
    __tablename__ = "user_destinations"
    __table_args__ = (UniqueConstraint("user_id", "dest_key", name="uq_user_dest"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    dest_key: Mapped[str] = mapped_column(String(160))
    name: Mapped[str] = mapped_column(String(200))
    country: Mapped[str] = mapped_column(String(200), default="")
    lat: Mapped[float] = mapped_column(default=0.0)
    lng: Mapped[float] = mapped_column(default=0.0)
    airport: Mapped[str] = mapped_column(String(10), default="")
    days: Mapped[int] = mapped_column(default=4)
    budget_low: Mapped[int] = mapped_column(default=100)
    budget_high: Mapped[int] = mapped_column(default=200)
    tagline: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[dict] = mapped_column(JSON, default=dict)  # attractions/activities/famous
    custom: Mapped[bool] = mapped_column(default=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class WishlistItem(Base):
    """A shared, group-visible wishlist entry — any member can add one; every
    member of the group sees the same list (unlike the personal, solo,
    localStorage-only Bucket List)."""
    __tablename__ = "wishlist_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id"))
    added_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    destination_id: Mapped[str] = mapped_column(String(120))
    name: Mapped[str] = mapped_column(String(200))
    country: Mapped[str] = mapped_column(String(200), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Availability(Base):
    """A date range one member says they're free — the group's overlap window
    is computed from the intersection of everyone's submitted ranges."""
    __tablename__ = "availability"
    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)


class DestinationResearch(Base):
    """Cached output of the Research Agent's web research for one destination —
    avoids re-searching (and re-spending) on every page view. Treated as stale
    after RESEARCH_TTL_HOURS (see agents/research_agent.py)."""
    __tablename__ = "destination_research"
    id: Mapped[int] = mapped_column(primary_key=True)
    destination_key: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    best_time: Mapped[str] = mapped_column(Text, default="")
    price_insight: Mapped[str] = mapped_column(Text, default="")
    top_activities: Mapped[list] = mapped_column(JSON, default=list)
    recommendation: Mapped[str] = mapped_column(Text, default="")  # Negotiator agent's evaluated synthesis
    sources: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class ApiCache(Base):
    """Shared cache for paid/slow upstream calls. Lives in the main database (not
    a per-instance file) so every serverless instance reuses the same entries."""
    __tablename__ = "api_cache"
    key: Mapped[str] = mapped_column(String(300), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class ApiUsage(Base):
    """One row per paid upstream call actually made (cache hits are free and
    never recorded). Backs the per-user rate limit."""
    __tablename__ = "api_usage"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now, index=True)
