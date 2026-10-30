"""The Research Agent: finds real points of interest for a destination,
informed by the WHOLE group's aggregated needs (likes, dislikes, food
preferences, must-see items, trip priority) — not just the destination name in
isolation. Built with LangChain (a ChatOpenAI-compatible model pointed at
OpenRouter, bound to a Tavily search tool) so it's part of the same
LangGraph/LangChain pipeline as the rest of the agent system, not a separate
CrewAI crew.

Falls back to the static GraphRAG seed dataset (graphrag.pois_for_destination)
when no OPENROUTER_API_KEY/TAVILY_API_KEY is configured — the same
graceful-degrade pattern as everywhere else in this app. That fallback is
explicitly the FALLBACK now, not the primary source of truth: real,
web-researched POIs are what a configured deployment actually uses.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timedelta, timezone

from app.agents import budget_guard

MAX_RESEARCH_LLM_CALLS = 2  # one search-planning call + one synthesis call, capped
RESEARCH_TTL_HOURS = 24


def is_stale(created_at: datetime) -> bool:
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - created_at > timedelta(hours=RESEARCH_TTL_HOURS)


def is_configured() -> bool:
    return bool(os.environ.get("TAVILY_API_KEY")) and bool(os.environ.get("OPENROUTER_API_KEY"))


def _needs_summary(needs: dict) -> str:
    parts = []
    if needs.get("likes"):
        parts.append(f"likes: {', '.join(needs['likes'])}")
    if needs.get("dislikes"):
        parts.append(f"dislikes (avoid): {', '.join(needs['dislikes'])}")
    if needs.get("food_preferences"):
        parts.append(f"food preferences: {', '.join(needs['food_preferences'])}")
    if needs.get("must_see"):
        parts.append(f"must include if possible: {', '.join(needs['must_see'])}")
    if needs.get("trip_priorities"):
        parts.append(f"trip priorities across the group: {', '.join(needs['trip_priorities'])}")
    return "; ".join(parts) or "no strong preferences stated"


def _search_and_synthesize(destination_name: str, needs_text: str, avoid_categories: list[str]) -> list[dict] | None:
    """One Tavily search + one LLM synthesis call (via LangChain), turning raw
    search results into a structured POI list. Returns None on any failure or
    if guardrails block it, so the caller falls back to the static seed."""
    allowed, reason = budget_guard.allow_call()
    if not allowed:
        print(f"[research_agent] budget guard blocked: {reason}")
        return None
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        from langchain_openai import ChatOpenAI
        from tavily import TavilyClient

        tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
        query = f"best things to do in {destination_name} for travelers who like: {needs_text}"
        search_results = tavily.search(query=query, max_results=6, search_depth="basic")
        budget_guard.record_call()
        snippets = "\n".join(f"- {r.get('title', '')}: {r.get('content', '')[:300]}" for r in search_results.get("results", []))

        model = os.environ.get("MEDIATOR_MODEL", "google/gemini-2.5-flash-lite")
        llm = ChatOpenAI(model=model, api_key=os.environ["OPENROUTER_API_KEY"], base_url="https://openrouter.ai/api/v1")
        avoid_line = f" Do NOT include anything in these categories: {', '.join(avoid_categories)}." if avoid_categories else ""
        system = (
            "You turn raw web search results into a structured list of points of interest for a trip. "
            "Respond ONLY in English (transliterate place names if needed), and ONLY with a strict JSON array: "
            '[{"name": str, "category": one of '
            '["museums","history","food","nature","hiking","adventure","nightlife","beaches","relaxed",'
            '"urban","wildlife","technology","shopping","romance"], "est_cost": number (USD, your best estimate)}]. '
            f"Pick 4-6 items that best fit the travelers' needs.{avoid_line}"
        )
        resp = llm.invoke([SystemMessage(content=system), HumanMessage(content=snippets or "No search results found.")])
        budget_guard.record_call()
        content = resp.content.strip()
        content = re.sub(r"^```(json)?|```$", "", content, flags=re.MULTILINE).strip()
        pois = json.loads(content)
        return [p for p in pois if isinstance(p, dict) and p.get("name")]
    except Exception as exc:
        print(f"[research_agent] search/synthesis failed, falling back to static seed: {exc}")
        return None


def research_pois(destination_id: str, destination_name: str, needs: dict, avoid_categories: list[str] | None = None) -> tuple[list[dict], str]:
    """Returns (pois, source) where source is "web" or "unavailable" — surfaced
    in the Proposal note so it's always visible whether a route came from real
    research or the offline fallback (the "hardcoded information" the group
    should be able to tell apart from the real thing)."""
    avoid_categories = avoid_categories or []
    if is_configured():
        needs_text = _needs_summary(needs)
        pois = _search_and_synthesize(destination_name, needs_text, avoid_categories)
        if pois:
            return pois, "web"
    return [], "unavailable"


def research_insights(destination_name: str, max_budget: float | None = None) -> dict:
    """Best time to visit / price trend / recommendation for a destination —
    the standalone "research this place" feature (distinct from research_pois,
    which is the negotiation pipeline's POI-finding step). LangChain +
    Tavily, same graceful-degrade rules as research_pois. `max_budget`, when
    known, is passed to the model as a hard ceiling to evaluate against —
    rather than silently ignore what the group can actually afford."""
    if not is_configured():
        return {
            "status": "not_configured",
            "message": "Set TAVILY_API_KEY and OPENROUTER_API_KEY to enable live web research for this destination.",
            "best_time": "", "price_insight": "", "top_activities": [], "recommendation": "",
        }
    allowed, reason = budget_guard.allow_call()
    if not allowed:
        return {"status": "budget_exceeded", "message": reason, "best_time": "", "price_insight": "",
                "top_activities": [], "recommendation": ""}
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        from langchain_openai import ChatOpenAI
        from tavily import TavilyClient

        tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
        search = tavily.search(query=f"best time to visit {destination_name} weather crowds cheap flight deals popular activities",
                               max_results=6, search_depth="basic")
        budget_guard.record_call()
        snippets = "\n".join(f"- {r.get('title', '')}: {r.get('content', '')[:300]}" for r in search.get("results", []))

        model = os.environ.get("MEDIATOR_MODEL", "google/gemini-2.5-flash-lite")
        llm = ChatOpenAI(model=model, api_key=os.environ["OPENROUTER_API_KEY"], base_url="https://openrouter.ai/api/v1")
        budget_line = (f"The group's budget ceiling is ${max_budget:.0f} total — flag clearly if price trends exceed it."
                      if max_budget else "No budget ceiling was given.")
        system = (
            "You research a travel destination from web search results. Respond only in English. "
            "Return strict JSON: {\"best_time\": \"2-3 sentences\", \"price_insight\": \"2-3 sentences on flight "
            "price trends\", \"top_activities\": [4-6 short strings], \"recommendation\": "
            f"\"3-4 sentence final recommendation, budget-aware. {budget_line}\"}}"
        )
        resp = llm.invoke([SystemMessage(content=system), HumanMessage(content=snippets or "No search results found.")])
        budget_guard.record_call()
        content = re.sub(r"^```(json)?|```$", "", resp.content.strip(), flags=re.MULTILINE).strip()
        data = json.loads(content)
        return {
            "status": "ok", "best_time": data.get("best_time", ""), "price_insight": data.get("price_insight", ""),
            "top_activities": data.get("top_activities", []) or [], "recommendation": data.get("recommendation", ""),
        }
    except Exception as exc:
        print(f"[research_agent] insights failed, returning empty result: {exc}")
        return {"status": "error", "message": str(exc), "best_time": "", "price_insight": "",
                "top_activities": [], "recommendation": ""}
