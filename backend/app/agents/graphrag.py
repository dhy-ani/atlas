"""GraphRAG: contextual place relationships, backed by Neo4j when reachable and a
static in-memory graph (from data/graph_seed.json) otherwise. Same function
signatures either way, so the mediator never has to know which mode it's in — the
same graceful-degrade pattern used for every other external dependency in this app.

Graph shape (see backend/scripts/ingest_graphrag.py for the real Cypher):
    (:Place)-[:IS_IN]->(:City)-[:LOCATED_IN]->(:Country)
    (:Place)-[:HAS_CATEGORY]->(:Category)
    (:City)-[:HAS_SAFETY]->(:SafetyLevel)
    (:City)-[:BEST_SEASON]->(:Season)
    (:POI)-[:LOCATED_IN]->(:Place)          -- points of interest WITHIN a destination
    (:POI)-[:HAS_CATEGORY]->(:Category)

The group-negotiation loop plans a route WITHIN a single chosen destination — the
`pois_*` functions below, not `similar_places`/`alternatives_for_dislike` (which
operate between destinations, e.g. for the personal multi-city Route Planner).
"""
from __future__ import annotations

import json
import os
from pathlib import Path

SEED_PATH = Path(__file__).resolve().parents[2] / "data" / "graph_seed.json"


def _load_seed() -> dict:
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


_SEED = _load_seed()


def _neo4j_driver():
    """Returns a connected driver, or None if the package/service isn't available."""
    uri = os.environ.get("NEO4J_URI", "")
    if not uri:
        return None
    try:
        from neo4j import GraphDatabase
        user = os.environ.get("NEO4J_USER", "neo4j")
        password = os.environ.get("NEO4J_PASSWORD", "")
        driver = GraphDatabase.driver(uri, auth=(user, password))
        driver.verify_connectivity()
        return driver
    except Exception as exc:
        print(f"[graphrag] Neo4j unreachable, using static seed graph: {exc}")
        return None


def is_live() -> bool:
    d = _neo4j_driver()
    if d:
        d.close()
        return True
    return False


def similar_places(dest_id: str, limit: int = 5) -> list[dict]:
    """Places sharing at least one category with `dest_id`, ranked by overlap."""
    driver = _neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                rows = session.run(
                    """
                    MATCH (p:Place {id:$id})-[:HAS_CATEGORY]->(c:Category)<-[:HAS_CATEGORY]-(other:Place)
                    WHERE other.id <> $id
                    WITH other, count(c) AS overlap
                    ORDER BY overlap DESC LIMIT $limit
                    RETURN other.id AS id, other.name AS name, overlap
                    """,
                    id=dest_id, limit=limit,
                ).data()
            return rows
        finally:
            driver.close()

    target = _SEED.get(dest_id)
    if not target:
        return []
    scored = []
    for other_id, meta in _SEED.items():
        if other_id == dest_id:
            continue
        overlap = len(set(meta["categories"]) & set(target["categories"]))
        if overlap:
            scored.append({"id": other_id, "overlap": overlap})
    return sorted(scored, key=lambda x: -x["overlap"])[:limit]


def alternatives_for_dislike(disliked_category: str, prefer_categories: list[str] | None = None,
                              exclude_ids: list[str] | None = None, limit: int = 3) -> list[dict]:
    """Places that do NOT carry `disliked_category`, ranked by overlap with
    `prefer_categories` — used by the mediator to reconfigure a rejected proposal."""
    exclude_ids = set(exclude_ids or [])
    prefer = set(prefer_categories or [])
    driver = _neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                rows = session.run(
                    """
                    MATCH (p:Place)
                    WHERE NOT (p)-[:HAS_CATEGORY]->(:Category {name:$disliked})
                      AND NOT p.id IN $exclude
                    OPTIONAL MATCH (p)-[:HAS_CATEGORY]->(pref:Category) WHERE pref.name IN $prefer
                    WITH p, count(pref) AS match_score
                    ORDER BY match_score DESC LIMIT $limit
                    RETURN p.id AS id, p.name AS name, match_score
                    """,
                    disliked=disliked_category, exclude=list(exclude_ids), prefer=list(prefer), limit=limit,
                ).data()
            return rows
        finally:
            driver.close()

    scored = []
    for pid, meta in _SEED.items():
        if pid in exclude_ids or disliked_category in meta["categories"]:
            continue
        match = len(set(meta["categories"]) & prefer)
        scored.append({"id": pid, "match_score": match})
    return sorted(scored, key=lambda x: -x["match_score"])[:limit]


def categories_of(dest_id: str) -> list[str]:
    """Just the category list for a place — used to give a swapped-in alternative
    a real category (not a placeholder) so future rounds can score it accurately."""
    driver = _neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                rows = session.run(
                    "MATCH (p:Place {id:$id})-[:HAS_CATEGORY]->(c:Category) RETURN c.name AS name",
                    id=dest_id,
                ).data()
            return [r["name"] for r in rows]
        finally:
            driver.close()
    return list(_SEED.get(dest_id, {}).get("categories", []))


def place_context(dest_id: str) -> dict:
    """Everything known about a place — used to enrich prompts before an LLM call
    instead of letting the model make its own follow-up tool calls."""
    driver = _neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                row = session.run(
                    """
                    MATCH (p:Place {id:$id})
                    OPTIONAL MATCH (p)-[:HAS_CATEGORY]->(c:Category)
                    OPTIONAL MATCH (p)-[:IS_IN]->(city:City)-[:HAS_SAFETY]->(s:SafetyLevel)
                    OPTIONAL MATCH (city)-[:BEST_SEASON]->(season:Season)
                    RETURN p.id AS id, collect(DISTINCT c.name) AS categories,
                           s.name AS safety, season.name AS season
                    """,
                    id=dest_id,
                ).single()
            return dict(row) if row else {}
        finally:
            driver.close()
    return {"id": dest_id, **_SEED.get(dest_id, {})}


# --------------------------------------------------------------------------- #
#  Points of interest WITHIN a single destination — what the group-negotiation
#  loop actually plans a route over (see module docstring).
# --------------------------------------------------------------------------- #
def pois_for_destination(dest_id: str) -> list[dict]:
    """All known POIs inside one destination, each with a name/category/cost."""
    driver = _neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                rows = session.run(
                    """
                    MATCH (poi:POI)-[:LOCATED_IN]->(:Place {id:$id})
                    OPTIONAL MATCH (poi)-[:HAS_CATEGORY]->(c:Category)
                    RETURN poi.name AS name, c.name AS category, poi.est_cost AS est_cost
                    """,
                    id=dest_id,
                ).data()
            if rows:
                return rows
        finally:
            driver.close()
    return []


def poi_alternatives(dest_id: str, disliked_category: str, prefer_categories: list[str] | None = None,
                     exclude_names: list[str] | None = None, limit: int = 3) -> list[dict]:
    """POIs within the SAME destination that avoid `disliked_category`, ranked by
    overlap with the group's collective likes. Used to reconfigure a rejected
    in-destination proposal without ever suggesting a different destination."""
    exclude = set(exclude_names or [])
    prefer = set(prefer_categories or [])
    pool = [p for p in pois_for_destination(dest_id) if p.get("category") != disliked_category and p.get("name") not in exclude]
    scored = [{"name": p["name"], "category": p.get("category", "general"), "est_cost": p.get("est_cost", 0),
               "match_score": 1 if p.get("category") in prefer else 0} for p in pool]
    return sorted(scored, key=lambda x: -x["match_score"])[:limit]
