"""Kick off a negotiation for a group's chosen destination and return the full
transcript. The mediator builds its own initial proposal from GraphRAG POIs +
Reddit trending + the group's collective likes — the frontend just picks WHICH
destination (from the group wishlist), not which places within it."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agents import budget_guard, cache, graphrag, llm_client
from app.agents.documentation_agent import document_negotiation
from app.agents.mediator import build_initial_proposal, run_negotiation
from app.agents.twin import DigitalTwin
from app.auth import get_current_user
from app.db.engine import get_db
from app.db.models import GroupMember, Identity, User
from app.models.agent_schemas import IdentityVector, NegotiationResult, Proposal
from app.services.destinations import by_id

router = APIRouter(prefix="/api/negotiate", tags=["negotiate"])


class NegotiateRequest(BaseModel):
    group_id: int
    destination_id: str
    max_rounds: int = 5


def _require_member(group_id: int, user: User, db: Session) -> None:
    is_member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == user.id).first()
    if not is_member:
        raise HTTPException(403, "you're not a member of this group")


def _twins_for_group(group_id: int, db: Session) -> list[DigitalTwin]:
    rows = db.query(Identity, User.name).join(User, User.id == Identity.user_id).filter(Identity.group_id == group_id).all()
    identities = [
        IdentityVector(
            member_name=name, group_id=str(group_id), budget_min=row.budget_min, budget_max=row.budget_max,
            pace=row.pace, likes=row.likes, dislikes=row.dislikes, hard_constraints=row.hard_constraints,
            accommodation_style=row.accommodation_style, food_preferences=row.food_preferences,
            must_see=row.must_see, avoid=row.avoid, chronotype=row.chronotype,
            transportation_pref=row.transportation_pref, trip_priority=row.trip_priority,
            accessibility_needs=row.accessibility_needs, notes=row.notes,
            version=row.version, updated_at=row.updated_at.isoformat(),
        )
        for row, name in rows
    ]
    return [DigitalTwin(identity) for identity in identities]


@router.post("/run", response_model=NegotiationResult)
def negotiate(req: NegotiateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_member(req.group_id, user, db)
    if by_id(req.destination_id) is None:
        raise HTTPException(404, f"unknown destination '{req.destination_id}'")
    twins = _twins_for_group(req.group_id, db)
    if not twins:
        raise HTTPException(404, "no members have completed the start survey for this group yet")

    initial = build_initial_proposal(req.destination_id, twins)
    if not initial.items:
        raise HTTPException(503, "Research data for this destination is unavailable at the moment.")
    result = run_negotiation(twins, initial, max_rounds=req.max_rounds)
    result.narrative = document_negotiation(result)
    return result


@router.get("/preview/{destination_id}", response_model=Proposal)
def preview_initial_proposal(destination_id: str, group_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lets the UI show the agent's proposed route before committing to a full
    negotiation run — same proposal-building logic /run uses internally."""
    _require_member(group_id, user, db)
    if by_id(destination_id) is None:
        raise HTTPException(404, f"unknown destination '{destination_id}'")
    twins = _twins_for_group(group_id, db)
    return build_initial_proposal(destination_id, twins)


@router.get("/category/{dest_id}")
def category(dest_id: str):
    """Lets the frontend build proposals with a real GraphRAG category instead of
    a placeholder — without this, a twin's likes/dislikes never actually match a
    UI-driven proposal item."""
    cats = graphrag.categories_of(dest_id)
    return {"destination_id": dest_id, "categories": cats, "primary": cats[0] if cats else "general"}


@router.get("/status")
def status():
    """Cost/infra visibility: is the LLM configured, how much has been cached,
    and how much of today's hard spend budget has been used."""
    return {
        "llm_configured": llm_client.has_llm(),
        "twin_model": llm_client.twin_model(),
        "mediator_model": llm_client.mediator_model(),
        **cache.stats(),
        "budget": budget_guard.usage_today(),
    }
