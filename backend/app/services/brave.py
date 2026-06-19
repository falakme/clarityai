"""Brave Search integration — retrieval step of the agentic recommendation engine.

Given a document category (eviction, medical, food assistance, ...) and an
optional location, this composes a query biased toward trustworthy support
organisations and returns the RAW search hits. The hits are NOT shown to the
user directly: they are passed back into the model (see `nvidia.evaluate_resources`)
which selects the single most relevant and trustworthy resource and explains
why. This is the "Retrieval" half of a Retrieval-Augmented Evaluation pipeline.

Gracefully returns an empty list when no API key is configured or the upstream
errors — recommendations are an enhancement, never a hard dependency.
"""

from __future__ import annotations

import httpx

from app.config import get_settings
from app.schemas import SearchResult

# Per-category query templates. "{loc}" is replaced with the detected location.
# Designed to return diverse, trustworthy results — not locked to a single site.
_QUERY_TEMPLATES: dict[str, str] = {
    "eviction": "free eviction legal aid tenant rights help {loc}",
    "housing": "emergency housing assistance rental help nonprofit {loc}",
    "medical": "hospital patient financial assistance charity care medical bills help {loc}",
    "food_assistance": "food bank SNAP food pantry assistance {loc}",
    "utility": "emergency utility bill assistance energy help program {loc}",
    "legal": "free legal aid lawyer consultation law clinic {loc}",
    "benefits": "government benefits assistance program eligibility help {loc}",
    "general": "local crisis support assistance nonprofit program {loc}",
    "school": "school parent rights education support resource {loc}",
    "emergency": "emergency crisis assistance hotline shelter {loc}",
}


def build_recommendation_query(category: str, location: str = "") -> str:
    """Compose a Brave query for a document category + optional location."""
    template = _QUERY_TEMPLATES.get((category or "").strip().lower(), _QUERY_TEMPLATES["general"])
    loc = (location or "").strip()
    return template.format(loc=loc).replace("  ", " ").strip()


async def search(query: str, count: int = 8) -> list[SearchResult]:
    """Run a Brave web search and return raw hits. Empty list if not configured."""
    settings = get_settings()
    if not settings.brave_api_key or not query:
        return []

    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": settings.brave_api_key,
    }
    params = {"q": query, "count": count, "result_filter": "web"}

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(settings.brave_base_url, headers=headers, params=params)
        if resp.status_code >= 400:
            return []
        body = resp.json()
    except (httpx.HTTPError, ValueError):
        return []

    results: list[SearchResult] = []
    for item in (body.get("web", {}) or {}).get("results", []) or []:
        url = str(item.get("url", "")).strip()
        title = str(item.get("title", "")).strip()
        if not url or not title:
            continue
        results.append(
            SearchResult(
                title=title,
                url=url,
                description=str(item.get("description", "")).strip(),
            )
        )
        if len(results) >= count:
            break

    return results
