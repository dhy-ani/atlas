"""The Documentation Agent: turns a NegotiationResult into a clear, human
-readable narrative of WHY the group ended up where it did — which twin
rejected what and why, what the mediator swapped in response, and how the
score moved round to round. This is deliberately NOT an LLM call: everything
it needs (verdicts, reasoning strings, scores) was already captured for free
by the rule-based scorer or the batched LLM call that already happened during
negotiation — narrating it again with another LLM call would just be spending
money to reformat text we already have. If you want a more natural-prose
version later, that's a good candidate for ONE extra cached call, but the
deterministic version below covers the actual ask: a transparent record of the
agents' reasoning, not another opinion.
"""
from __future__ import annotations

from app.models.agent_schemas import NegotiationResult, Verdict


def document_negotiation(result: NegotiationResult) -> str:
    lines: list[str] = []
    lines.append(f"# Negotiation record — {result.final_proposal.destination_id or 'destination'}")
    lines.append("")
    lines.append(
        f"**Outcome:** {'Accepted' if result.accepted else 'Hit the round limit without full agreement'} "
        f"after {len(result.rounds)} round(s), final score **{result.final_score}**."
    )
    lines.append(
        f"**Cost:** {result.llm_calls_made} LLM call(s) made, {result.cache_hits} served from cache "
        f"(engine: `{result.engine}`)."
    )
    lines.append("")

    for round_ in result.rounds:
        lines.append(f"## Round {round_.round} — score {round_.final_score}"
                    + (" (penalty: 2+ rejections)" if round_.penalty_applied else ""))
        lines.append(f"Proposed: {', '.join(i.name for i in round_.proposal.items)}")
        if round_.proposal.note:
            lines.append(f"*Mediator's note: {round_.proposal.note}*")
        lines.append("")
        for v in round_.verdicts:
            icon = {"ACCEPT": "", "NEUTRAL": "", "REJECT": ""}[v.verdict.value if isinstance(v.verdict, Verdict) else v.verdict]
            lines.append(f"- {icon} **{v.member_name}** ({v.via}): {v.verdict} at {v.personal_score} — {v.reasoning}")
        lines.append("")

    reject_rounds = [r for r in result.rounds if r.reject_count > 0]
    if reject_rounds:
        lines.append("## Why it took more than one round")
        for r in reject_rounds:
            rejecters = [v.member_name for v in r.verdicts if v.verdict in (Verdict.REJECT, "REJECT")]
            lines.append(f"- Round {r.round}: {', '.join(rejecters)} weren't satisfied, so the mediator "
                        f"reconfigured using GraphRAG alternatives within the same destination.")
        lines.append("")

    return "\n".join(lines)
