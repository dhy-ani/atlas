"""The negotiation pipeline — ONE LangGraph state machine coordinating four
distinct agent roles, per the group-planning architecture:

    Research  -> finds real POIs for the destination, informed by the WHOLE
                 group's aggregated needs (research_agent.py)
    Planner   -> turns research into a concrete, budget-capped Proposal
    Twins     -> each member's Digital Twin scores the proposal (twin.py)
    Negotiator-> on rejection, decides what needs to change and sends a fresh
                 directive back to Research (avoid these categories) so the
                 next Planner pass can build a genuinely different proposal
    Documentation -> compiles the finished plan into a record for the group
                 (documentation_agent.py, called once negotiation ends)

Built as a LangGraph StateGraph when the `langgraph` package is installed;
falls back to an identical plain-Python loop otherwise (same node functions
either way, so behavior never differs — only the orchestration wrapper does).
This means the whole pipeline is fully testable before you `pip install
langgraph`, and fully functional with $0 spent before you configure any LLM/
search key (Research falls back to the static GraphRAG seed; Twin scoring
stays on the free rule-based path; Negotiator's category-avoidance logic is
plain Python either way).
"""
from __future__ import annotations

from typing import TypedDict

from app.agents import graphrag, llm_client, reasoner, research_agent, scraper
from app.agents.twin import DigitalTwin
from app.models.agent_schemas import (
    NegotiationResult,
    NegotiationRound,
    Proposal,
    ProposalItem,
    TwinVerdict,
    Verdict,
)
from app.services.destinations import by_id

MAX_ROUNDS = 5
SCORE_THRESHOLD = 80
REJECT_PENALTY = 0.55   # applied when >=2 twins reject — "hurts the score" per spec


class _NegotiationState(TypedDict):
    """Module-level (not nested) so LangGraph's `get_type_hints()` introspection can
    resolve it — a TypedDict defined inside a function isn't visible to that call,
    since it only sees the function's module globals, not its enclosing locals."""
    proposal: Proposal
    pois: list[dict]
    poi_source: str
    avoid_categories: list[str]
    exclude_names: list[str]
    rounds: list[NegotiationRound]
    round_num: int
    stalled: bool


# --------------------------------------------------------------------------- #
#  Research agent — finds candidate POIs, informed by everyone's needs
# --------------------------------------------------------------------------- #
def aggregate_needs(twins: list[DigitalTwin]) -> dict:
    """Combines every twin's Identity Vector into one 'what does this GROUP
    want' summary — this is what makes research genuinely group-aware instead
    of researching the destination in a vacuum."""
    return {
        "likes": sorted({like for t in twins for like in t.identity.likes}),
        "dislikes": sorted({d for t in twins for d in t.identity.dislikes}),
        "food_preferences": sorted({f for t in twins for f in getattr(t.identity, "food_preferences", [])}),
        "must_see": sorted({m for t in twins for m in getattr(t.identity, "must_see", [])}),
        "trip_priorities": sorted({t.identity.trip_priority for t in twins if getattr(t.identity, "trip_priority", None)}),
    }


def research_pois(destination_id: str, twins: list[DigitalTwin], avoid_categories: list[str] | None = None) -> tuple[list[dict], str]:
    dest = by_id(destination_id)
    dest_name = dest["name"] if dest else destination_id
    needs = aggregate_needs(twins)
    pois, source = research_agent.research_pois(destination_id, dest_name, needs, avoid_categories)
    return pois, source


# --------------------------------------------------------------------------- #
#  Planner agent — turns candidate POIs into a concrete, budget-capped Proposal
# --------------------------------------------------------------------------- #
def plan_proposal(destination_id: str, pois: list[dict], twins: list[DigitalTwin], poi_source: str,
                  exclude_names: list[str] | None = None, top_n: int = 4) -> Proposal:
    if not pois:
        return Proposal(destination_id=destination_id, items=[], total_cost=0, note="no known POIs for this destination")

    exclude = set(exclude_names or [])
    all_likes = {like for t in twins for like in t.identity.likes}
    all_dislikes = {dislike for t in twins for dislike in t.identity.dislikes}
    trending = scraper.trending_scores(destination_id, [p["name"] for p in pois])

    scored = []
    for poi in pois:
        if poi["name"] in exclude:
            continue
        cat = poi.get("category", "general")
        like_score = 1.0 if cat in all_likes else (-1.0 if cat in all_dislikes else 0.0)
        scored.append((like_score + trending.get(poi["name"], 0.0), poi))
    scored.sort(key=lambda x: -x[0])

    # Budget guardrail: the group's most budget-constrained twin sets the
    # ceiling — reasoner.rule_score hard-rejects (score=15) ANY proposal over
    # ANY twin's budget_max, so proposing past that isn't "ambitious," it's a
    # proposal that's mathematically guaranteed to fail round 1. Greedily add
    # top-ranked POIs while staying under the ceiling, instead of blindly
    # taking the top `top_n` regardless of cost.
    budget_ceiling = min((t.identity.budget_max for t in twins), default=float("inf"))
    chosen, running_cost = [], 0.0
    for _, poi in scored:
        if len(chosen) >= top_n:
            break
        cost = poi.get("est_cost", 0)
        if running_cost + cost > budget_ceiling:
            continue  # skip this one, keep looking for a cheaper fit lower in the ranking
        chosen.append(poi)
        running_cost += cost

    items = [ProposalItem(destination_id=_slug(p["name"]), name=p["name"],
                          category=p.get("category", "general"), est_cost=p.get("est_cost", 0)) for p in chosen]
    note = f"planned from {poi_source} POIs by group likes + trending signal, within budget"
    if len(chosen) < min(top_n, len(pois)):
        note += f" (fewer items than usual — ${budget_ceiling:.0f} budget ceiling limited selection)"
    return Proposal(destination_id=destination_id, items=items, total_cost=round(running_cost, 2), note=note)


def build_initial_proposal(destination_id: str, twins: list[DigitalTwin], top_n: int = 4) -> Proposal:
    """Research + Plan in one call — the convenience entrypoint used outside a
    full negotiation run (e.g. the /preview endpoint)."""
    pois, source = research_pois(destination_id, twins)
    return plan_proposal(destination_id, pois, twins, source, top_n=top_n)


def _slug(name: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in name).strip("-")


# --------------------------------------------------------------------------- #
#  Twins scoring — each member's Digital Twin evaluates the current proposal
# --------------------------------------------------------------------------- #
def _score_round(twins: list[DigitalTwin], proposal: Proposal) -> tuple[list[TwinVerdict], float, int, bool, float]:
    """Runs the free rule pass for everyone, then ONE batched LLM call for whichever
    twins landed in the ambiguous zone (if an LLM is configured)."""
    rule_verdicts = {t.identity.member_name: t.rule_evaluate(proposal) for t in twins}
    ambiguous_names = [name for name, v in rule_verdicts.items() if reasoner.is_ambiguous(v.personal_score)]

    final_verdicts: dict[str, TwinVerdict] = dict(rule_verdicts)

    if ambiguous_names and llm_client.has_llm():
        twins_by_name = {t.identity.member_name: t for t in twins}
        proposal_summary = ", ".join(f"{i.name} ({i.category}, ${i.est_cost:.0f})" for i in proposal.items)
        context = [
            {
                "member_name": name,
                "identity_summary": {
                    "likes": twins_by_name[name].identity.likes,
                    "dislikes": twins_by_name[name].identity.dislikes,
                    "budget_max": twins_by_name[name].identity.budget_max,
                    "pace": twins_by_name[name].identity.pace,
                },
                "memory_hits": twins_by_name[name].recall_memory(proposal),
            }
            for name in ambiguous_names
        ]
        llm_result = llm_client.batched_twin_scores(context, proposal_summary)
        if llm_result:
            for v in llm_result.get("verdicts", []):
                name = v.get("member_name")
                if name in ambiguous_names:
                    final_verdicts[name] = TwinVerdict(
                        member_name=name, verdict=Verdict(v.get("verdict", "NEUTRAL")),
                        personal_score=float(v.get("score", 50)), reasoning=v.get("reasoning", ""), via="llm",
                    )

    verdicts = list(final_verdicts.values())
    base_score = sum(v.personal_score for v in verdicts) / len(verdicts) if verdicts else 0.0
    reject_count = sum(1 for v in verdicts if v.verdict == Verdict.REJECT)
    penalty_applied = reject_count >= 2
    final_score = base_score * (REJECT_PENALTY if penalty_applied else 1.0)
    return verdicts, base_score, reject_count, penalty_applied, final_score


# --------------------------------------------------------------------------- #
#  Negotiator agent — decides what must change, directs Research + Planner
# --------------------------------------------------------------------------- #
def negotiator_directive(proposal: Proposal, twins: list[DigitalTwin], verdicts: list[TwinVerdict]) -> tuple[list[str], list[str]]:
    """Not a swap itself — the Negotiator's job is deciding WHAT needs to
    change (which categories are causing rejections) and handing that
    directive to Research/Planner, rather than picking a replacement itself.
    Returns (avoid_categories, exclude_names)."""
    twins_by_name = {t.identity.member_name: t for t in twins}
    rejecting = [v for v in verdicts if v.verdict != Verdict.ACCEPT]

    avoid_categories = set()
    for verdict in rejecting:
        twin = twins_by_name.get(verdict.member_name)
        if not twin:
            continue
        proposal_categories = {i.category for i in proposal.items}
        avoid_categories |= set(twin.identity.dislikes) & proposal_categories

    exclude_names = [i.name for i in proposal.items]  # never re-propose what's already on the table
    return sorted(avoid_categories), exclude_names


# --------------------------------------------------------------------------- #
#  Orchestration — LangGraph state machine wiring the four roles together
# --------------------------------------------------------------------------- #
def _run_plain_loop(destination_id: str, twins: list[DigitalTwin], initial_proposal: Proposal, max_rounds: int) -> list[NegotiationRound]:
    """The orchestration logic, as a bare Python loop. Used directly when
    `langgraph` isn't installed, and also mirrors exactly what the LangGraph
    graph below does node-for-node."""
    proposal = initial_proposal
    rounds: list[NegotiationRound] = []

    for round_num in range(1, max_rounds + 1):
        proposal.round = round_num
        verdicts, base_score, reject_count, penalty_applied, final_score = _score_round(twins, proposal)
        rounds.append(NegotiationRound(
            round=round_num, proposal=proposal, verdicts=verdicts, base_score=round(base_score, 1),
            reject_count=reject_count, penalty_applied=penalty_applied, final_score=round(final_score, 1),
        ))
        all_accept = all(v.verdict == Verdict.ACCEPT for v in verdicts)
        if all_accept or final_score >= SCORE_THRESHOLD or round_num == max_rounds:
            break

        # Negotiator decides the directive; Research + Planner act on it.
        avoid_categories, exclude_names = negotiator_directive(proposal, twins, verdicts)
        if not avoid_categories:
            break  # nothing actionable to change — converged as far as possible
        pois, source = research_pois(destination_id, twins, avoid_categories=avoid_categories)
        new_proposal = plan_proposal(destination_id, pois, twins, source, exclude_names=exclude_names)
        new_proposal.round = round_num + 1
        if {i.name for i in new_proposal.items} == {i.name for i in proposal.items} or not new_proposal.items:
            break  # no further alternative exists — converged as far as possible
        proposal = new_proposal

    return rounds


def _run_langgraph(destination_id: str, twins: list[DigitalTwin], initial_proposal: Proposal, max_rounds: int) -> list[NegotiationRound] | None:
    """Same negotiation as a LangGraph StateGraph, with Research/Plan/Score/
    Negotiate as distinct nodes: research -> plan -> score ->
    conditional(accept? -> END | negotiate -> research -> plan -> score ...).
    Returns None if `langgraph` isn't installed, so the caller falls back to
    `_run_plain_loop` (which runs the identical logic without the graph
    wrapper)."""
    try:
        from langgraph.graph import END, StateGraph
    except ImportError:
        return None

    def research_node(state: _NegotiationState) -> _NegotiationState:
        pois, source = research_pois(destination_id, twins, avoid_categories=state["avoid_categories"])
        return {**state, "pois": pois, "poi_source": source}

    def plan_node(state: _NegotiationState) -> _NegotiationState:
        proposal = plan_proposal(destination_id, state["pois"], twins, state["poi_source"], exclude_names=state["exclude_names"])
        proposal.round = state["round_num"]
        return {**state, "proposal": proposal}

    def score_node(state: _NegotiationState) -> _NegotiationState:
        proposal = state["proposal"]
        verdicts, base_score, reject_count, penalty_applied, final_score = _score_round(twins, proposal)
        rnd = NegotiationRound(
            round=state["round_num"], proposal=proposal, verdicts=verdicts, base_score=round(base_score, 1),
            reject_count=reject_count, penalty_applied=penalty_applied, final_score=round(final_score, 1),
        )
        return {**state, "rounds": state["rounds"] + [rnd], "stalled": False}

    def negotiate_node(state: _NegotiationState) -> _NegotiationState:
        last = state["rounds"][-1]
        avoid_categories, exclude_names = negotiator_directive(last.proposal, twins, last.verdicts)
        stalled = not avoid_categories
        return {
            **state, "avoid_categories": avoid_categories, "exclude_names": exclude_names,
            "round_num": state["round_num"] + 1, "stalled": stalled,
        }

    def should_continue(state: _NegotiationState) -> str:
        last = state["rounds"][-1]
        all_accept = all(v.verdict == Verdict.ACCEPT for v in last.verdicts)
        if all_accept or last.final_score >= SCORE_THRESHOLD or state["round_num"] >= max_rounds:
            return "end"
        return "negotiate"

    def after_negotiate(state: _NegotiationState) -> str:
        return "end" if state["stalled"] else "research"

    def after_research(state: _NegotiationState) -> str:
        # If Research found nothing usable beyond what's already been tried,
        # stop instead of looping forever with an unchanged proposal.
        exclude = set(state["exclude_names"])
        candidate_names = {p["name"] for p in state["pois"] if p["name"] not in exclude}
        return "end" if not candidate_names else "plan"

    # Entry point is `score`, using the initial_proposal the caller already
    # built (build_initial_proposal already ran Research + Plan once) — this
    # matches _run_plain_loop exactly. Research/Plan only re-run inside the
    # negotiate loop-back, when the Negotiator has an actual directive.
    graph = StateGraph(_NegotiationState)
    graph.add_node("research", research_node)
    graph.add_node("plan", plan_node)
    graph.add_node("score", score_node)
    graph.add_node("negotiate", negotiate_node)
    graph.set_entry_point("score")
    graph.add_conditional_edges("score", should_continue, {"end": END, "negotiate": "negotiate"})
    graph.add_conditional_edges("negotiate", after_negotiate, {"research": "research", "end": END})
    graph.add_conditional_edges("research", after_research, {"plan": "plan", "end": END})
    graph.add_edge("plan", "score")
    app = graph.compile()

    result = app.invoke(
        {
            "proposal": initial_proposal, "pois": [], "poi_source": "web",
            "avoid_categories": [], "exclude_names": [i.name for i in initial_proposal.items],
            "rounds": [], "round_num": 1, "stalled": False,
        },
        {"recursion_limit": max_rounds * 5 + 5},
    )
    return result["rounds"]


def run_negotiation(twins: list[DigitalTwin], initial_proposal: Proposal, max_rounds: int = MAX_ROUNDS) -> NegotiationResult:
    llm_client.LLMStats.reset()
    destination_id = initial_proposal.destination_id

    rounds = _run_langgraph(destination_id, twins, initial_proposal, max_rounds)
    engine = "langgraph"
    if rounds is None:
        rounds = _run_plain_loop(destination_id, twins, initial_proposal, max_rounds)
        engine = "plain-loop"

    last = rounds[-1]
    all_accept = all(v.verdict == Verdict.ACCEPT for v in last.verdicts)
    accepted = all_accept or last.final_score >= SCORE_THRESHOLD
    hit_max = not accepted and len(rounds) >= max_rounds

    return NegotiationResult(
        group_id=twins[0].identity.group_id if twins else "",
        rounds=rounds, final_proposal=last.proposal, final_score=last.final_score,
        accepted=accepted, hit_max_rounds=hit_max,
        llm_calls_made=llm_client.LLMStats.calls_made, cache_hits=llm_client.LLMStats.cache_hits,
        engine=engine,
    )
