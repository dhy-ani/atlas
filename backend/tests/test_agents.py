"""Tests for the multi-agent negotiation system. All run on the free rule-based
path (no OPENROUTER_API_KEY, no Neo4j, no ChromaDB needed) — that's the point:
the whole loop must be provably correct at $0 before any paid key is added."""
import json
from pathlib import Path

from app.agents import graphrag, reasoner
from app.agents.mediator import build_initial_proposal, run_negotiation
from app.agents.twin import DigitalTwin
from app.models.agent_schemas import IdentityVector, Proposal, ProposalItem, Verdict

_POI_FIXTURES = json.loads((Path(__file__).parent / "fixtures" / "poi_fixtures.json").read_text(encoding="utf-8"))


def make_identity(name, group="test-group", **kw):
    return IdentityVector(member_name=name, group_id=group, **kw)


# --------------------------------------------------------------------------- #
#  Rule-based reasoner
# --------------------------------------------------------------------------- #
def test_rule_score_hard_budget_reject():
    identity = make_identity("A", budget_max=500)
    proposal = Proposal(items=[ProposalItem(destination_id="x", name="X", category="food", est_cost=100)], total_cost=900)
    score, reasoning = reasoner.rule_score(identity, proposal)
    assert score < 30
    assert "budget" in reasoning.lower()


def test_rule_score_likes_bonus_and_dislikes_penalty():
    identity = make_identity("A", likes=["museums"], dislikes=["beaches"])
    liked = Proposal(items=[ProposalItem(destination_id="x", name="X", category="museums", est_cost=100)], total_cost=100)
    disliked = Proposal(items=[ProposalItem(destination_id="y", name="Y", category="beaches", est_cost=100)], total_cost=100)
    liked_score, _ = reasoner.rule_score(identity, liked)
    disliked_score, _ = reasoner.rule_score(identity, disliked)
    assert liked_score > disliked_score
    assert liked_score >= 75      # verdict_for_score -> ACCEPT
    assert disliked_score < 75


def test_verdict_thresholds():
    assert reasoner.verdict_for_score(90) == Verdict.ACCEPT
    assert reasoner.verdict_for_score(60) == Verdict.NEUTRAL
    assert reasoner.verdict_for_score(20) == Verdict.REJECT


def test_ambiguous_zone():
    assert reasoner.is_ambiguous(70) is True
    assert reasoner.is_ambiguous(95) is False
    assert reasoner.is_ambiguous(30) is False


# --------------------------------------------------------------------------- #
#  GraphRAG (static-seed fallback path)
# --------------------------------------------------------------------------- #
def test_graphrag_similar_places():
    results = graphrag.similar_places("paris")
    assert len(results) > 0
    assert all("id" in r for r in results)


def test_graphrag_alternatives_excludes_disliked_category():
    alts = graphrag.alternatives_for_dislike("beaches", prefer_categories=["museums"])
    alt_ids = {a["id"] for a in alts}
    assert "rio" not in alt_ids  # rio is tagged "beaches" in the seed data


# --------------------------------------------------------------------------- #
#  Negotiation loop — plans a route WITHIN one destination (POIs), never a
#  choice between different destinations (that's the separate Route Planner).
# --------------------------------------------------------------------------- #
def test_negotiation_accepts_a_liked_proposal_immediately():
    alice = make_identity("Alice", group="g-accept", likes=["museums"], budget_max=2000)
    bob = make_identity("Bob", group="g-accept", likes=["museums"], budget_max=2000)
    proposal = Proposal(destination_id="paris",
                        items=[ProposalItem(destination_id="the-louvre", name="The Louvre", category="museums", est_cost=500)],
                        total_cost=500)

    result = run_negotiation([DigitalTwin(alice), DigitalTwin(bob)], proposal, max_rounds=5)

    # Accepted because EVERY twin actively ACCEPTed — that's honored even if the
    # blended score itself lands just under 80 (forcing more rounds once everyone
    # is already happy would contradict "honor every twin's preferences").
    assert result.accepted is True
    assert all(v.verdict == Verdict.ACCEPT for v in result.rounds[0].verdicts)
    assert len(result.rounds) == 1
    assert result.llm_calls_made == 0   # no key configured -> rule path only


def test_negotiation_reconfigures_within_the_same_destination_when_score_below_80():
    alice = make_identity("Alice", group="g-reconfig", likes=["museums", "food"], dislikes=["beaches"], budget_max=2000)
    bob = make_identity("Bob", group="g-reconfig", likes=["museums", "food"], dislikes=["beaches"], budget_max=2000)
    proposal = Proposal(destination_id="rio",
                        items=[ProposalItem(destination_id="copacabana", name="Copacabana & Ipanema", category="beaches", est_cost=500)],
                        total_cost=500)

    result = run_negotiation([DigitalTwin(alice), DigitalTwin(bob)], proposal, max_rounds=5)

    assert len(result.rounds) >= 2                                          # it actually tried a reconfiguration
    assert result.rounds[0].proposal.items[0].name == "Copacabana & Ipanema"
    assert result.rounds[-1].proposal.items[0].name != "Copacabana & Ipanema"  # swapped to a different POI...
    assert result.rounds[-1].proposal.destination_id == "rio"                # ...but STILL within Rio, never a different city
    assert result.rounds[-1].final_score > result.rounds[0].final_score      # and it's an improvement


def test_two_or_more_rejections_apply_score_penalty():
    # Two disliked categories in one proposal drags an individual score below the
    # REJECT threshold (<45) for twins who dislike both — this is what should
    # trigger the ">=2 rejections hurts the score" penalty multiplier.
    alice = make_identity("Alice", group="g-penalty", dislikes=["beaches", "nightlife"], budget_max=2000)
    bob = make_identity("Bob", group="g-penalty", dislikes=["beaches", "nightlife"], budget_max=2000)
    proposal = Proposal(destination_id="test-dest", items=[
        ProposalItem(destination_id="a", name="A", category="beaches", est_cost=100),
        ProposalItem(destination_id="b", name="B", category="nightlife", est_cost=100),
    ], total_cost=200)

    result = run_negotiation([DigitalTwin(alice), DigitalTwin(bob)], proposal, max_rounds=1)

    round1 = result.rounds[0]
    assert round1.reject_count >= 2
    assert round1.penalty_applied is True
    assert round1.final_score < round1.base_score   # penalty actually reduced the score


def test_negotiation_stops_early_when_no_alternative_exists_instead_of_burning_rounds():
    # Bob is merely lukewarm (no matching like/dislike) — there's nothing for the
    # mediator to actionably fix, so it should converge in 1 round, not max_rounds.
    alice = make_identity("Alice", group="g-stall", likes=["museums"], budget_max=2000)
    bob = make_identity("Bob", group="g-stall", budget_max=2000)  # no opinions at all
    proposal = Proposal(destination_id="paris",
                        items=[ProposalItem(destination_id="the-louvre", name="The Louvre", category="museums", est_cost=500)],
                        total_cost=500)

    result = run_negotiation([DigitalTwin(alice), DigitalTwin(bob)], proposal, max_rounds=5)

    assert len(result.rounds) < 5


def test_hard_budget_violation_cannot_be_talked_into_acceptance():
    alice = make_identity("Alice", group="g-budget", likes=["food"], budget_max=100)
    proposal = Proposal(destination_id="test-dest",
                        items=[ProposalItem(destination_id="x", name="X", category="food", est_cost=100)], total_cost=5000)

    result = run_negotiation([DigitalTwin(alice)], proposal, max_rounds=5)

    assert result.accepted is False
    assert all(v.personal_score < 30 for r in result.rounds for v in r.verdicts)


# --------------------------------------------------------------------------- #
#  Initial proposal building — the mediator picks the route itself, from
#  GraphRAG POIs matching the group's collective likes (+ Reddit trending,
#  which degrades to 0 boost for everyone if Reddit is unreachable in tests).
# --------------------------------------------------------------------------- #
def test_build_initial_proposal_prefers_liked_categories():
    alice = make_identity("Alice", group="g-init", likes=["museums", "history"], budget_max=2000)
    bob = make_identity("Bob", group="g-init", likes=["museums", "history"], budget_max=2000)

    proposal = build_initial_proposal("paris", [DigitalTwin(alice), DigitalTwin(bob)], top_n=3)

    assert proposal.destination_id == "paris"
    assert len(proposal.items) == 3
    # Paris POIs tagged museums/history should be ranked ahead of ones that aren't.
    categories = [i.category for i in proposal.items]
    assert "museums" in categories or "history" in categories


def test_build_initial_proposal_never_mixes_destinations():
    alice = make_identity("Alice", group="g-onecity", budget_max=2000)
    proposal = build_initial_proposal("tokyo", [DigitalTwin(alice)])
    known_tokyo_pois = {p["name"] for p in _POI_FIXTURES["tokyo"]}
    assert all(item.name in known_tokyo_pois for item in proposal.items)


def test_build_initial_proposal_unknown_destination_returns_empty():
    proposal = build_initial_proposal("atlantis", [])
    assert proposal.items == []


def test_build_initial_proposal_never_exceeds_the_tightest_budget():
    # A very tight budget should never be exceeded, even if it means fewer
    # items than top_n — "don't suggest something way above budget."
    tight = make_identity("Tight", group="g-budget-guard", budget_max=25)
    generous = make_identity("Generous", group="g-budget-guard", budget_max=5000)

    proposal = build_initial_proposal("paris", [DigitalTwin(tight), DigitalTwin(generous)], top_n=4)

    assert proposal.total_cost <= 25
    assert sum(i.est_cost for i in proposal.items) == proposal.total_cost
