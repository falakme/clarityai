"""NVIDIA Build API integration for the Crisis-to-Action translator.

Sends raw government form text to `google/gemma-3n-e4b-it` and parses a
strict JSON checklist back out. The system prompt forbids markdown and
preamble, but we still defensively extract the JSON object in case the
model wraps it.
"""

from __future__ import annotations

import json
import re

import httpx

from app.config import get_settings
from app.schemas import TranslateResponse

# The EXACT system prompt required by the spec. Do not edit casually — the
# downstream UI and Responsible AI guarantees depend on this schema.
SYSTEM_PROMPT = """You are a legal crisis translator. Your user is a stressed victim of a natural disaster who needs to fill out government relief paperwork immediately. 
I will provide you with the raw text of a government form or terms and conditions. 
Your ONLY job is to read the text, skip the standard boilerplate, and output a highly specific, actionable checklist in strict JSON format. Do not use markdown blocks, and do not say "Here is the JSON." Output ONLY the raw JSON object.

Follow this exact JSON schema:
{
  "bottom_line_summary": "A 1-sentence plain language summary of what this form gets the user.",
  "deadline": "The exact submission deadline extracted from the text, or null if none.",
  "required_attachments": ["List of physical documents needed, e.g., 'Utility Bill', 'Photo ID'"],
  "signature_locations": ["List of exactly where to sign, e.g., 'Page 3, Bottom Right'"],
  "critical_warnings": ["Any major catch, e.g., 'If you accept this, you waive other aid'"],
  "source_text_reference": "A 1-2 sentence direct quote from the original text that proves the deadline or warning."
}"""


class NvidiaConfigError(RuntimeError):
    """Raised when the NVIDIA API key is not configured."""


class NvidiaUpstreamError(RuntimeError):
    """Raised when the NVIDIA API returns an error or unparsable output."""


def _extract_json(content: str) -> dict:
    """Best-effort extraction of a JSON object from the model output."""
    content = content.strip()

    # Strip ```json ... ``` fences if the model ignored instructions.
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", content, re.DOTALL)
    if fence:
        content = fence.group(1).strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Fall back to the first balanced {...} block.
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1 and end > start:
        snippet = content[start : end + 1]
        return json.loads(snippet)

    raise NvidiaUpstreamError("Model did not return valid JSON.")


def _normalize(data: dict) -> TranslateResponse:
    """Coerce model output into our strict response schema."""

    def as_list(value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return [str(value).strip()]

    deadline = data.get("deadline")
    if isinstance(deadline, str) and deadline.strip().lower() in {"null", "none", ""}:
        deadline = None

    return TranslateResponse(
        bottom_line_summary=str(data.get("bottom_line_summary", "")).strip()
        or "No summary could be generated from the provided text.",
        deadline=deadline,
        required_attachments=as_list(data.get("required_attachments")),
        signature_locations=as_list(data.get("signature_locations")),
        critical_warnings=as_list(data.get("critical_warnings")),
        source_text_reference=str(data.get("source_text_reference", "")).strip(),
    )


async def translate_form(text: str) -> TranslateResponse:
    """Call the NVIDIA model and return a structured checklist."""
    settings = get_settings()

    if not settings.nvidia_api_key:
        raise NvidiaConfigError(
            "NVIDIA_API_KEY is not set. Add it to the backend environment."
        )

    payload = {
        "model": settings.nvidia_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "temperature": 0.2,
        "top_p": 0.7,
        "max_tokens": 1024,
        "stream": False,
    }

    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    url = f"{settings.nvidia_base_url.rstrip('/')}/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
    except httpx.HTTPError as exc:  # network-level failure
        raise NvidiaUpstreamError(f"Could not reach NVIDIA API: {exc}") from exc

    if resp.status_code >= 400:
        raise NvidiaUpstreamError(
            f"NVIDIA API error {resp.status_code}: {resp.text[:500]}"
        )

    body = resp.json()
    try:
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise NvidiaUpstreamError("Unexpected response shape from NVIDIA API.") from exc

    data = _extract_json(content)
    return _normalize(data)
