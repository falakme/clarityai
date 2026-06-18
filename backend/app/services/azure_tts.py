"""Microsoft Azure Cognitive Services — Text-to-Speech integration.

Synthesizes a premium neural English voice by POSTing SSML to the Azure
`/cognitiveservices/v1` endpoint and streaming back MP3 audio. Read-aloud is
English-only by product decision, so the SSML locale is fixed to en-US.

Authentication uses the subscription-key header (`Ocp-Apim-Subscription-Key`),
which the v1 endpoint accepts directly. When no key is configured the caller
should fall back to the browser's Web Speech synthesis.
"""

from __future__ import annotations

from xml.sax.saxutils import escape

import httpx

from app.config import get_settings

# 24 kHz mono MP3 — small, widely supported by the browser <audio> element.
_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3"
_SSML_LANG = "en-US"


class AzureTtsConfigError(RuntimeError):
    """Raised when the Azure TTS key is not configured."""


class AzureTtsUpstreamError(RuntimeError):
    """Raised when the Azure TTS endpoint returns an error."""


def _build_ssml(text: str, voice: str) -> str:
    """Wrap the (escaped) text in SSML for a neutral English neural voice."""
    safe = escape(text)
    return (
        f'<speak version="1.0" xml:lang="{_SSML_LANG}">'
        f'<voice xml:lang="{_SSML_LANG}" name="{voice}">{safe}</voice>'
        f"</speak>"
    )


async def synthesize_speech(text: str) -> bytes:
    """Return MP3 audio bytes for `text` using Azure neural TTS.

    Raises AzureTtsConfigError if unconfigured, AzureTtsUpstreamError on
    upstream failure.
    """
    settings = get_settings()
    if not settings.azure_tts_key:
        raise AzureTtsConfigError("AZURE_TTS_KEY is not set.")

    cleaned = (text or "").strip()
    if not cleaned:
        raise AzureTtsUpstreamError("No text to synthesize.")
    # Bound the request so a huge explanation can't run unbounded.
    cleaned = cleaned[:6000]

    headers = {
        "Ocp-Apim-Subscription-Key": settings.azure_tts_key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": _OUTPUT_FORMAT,
        "User-Agent": "clarityai",
    }
    ssml = _build_ssml(cleaned, settings.azure_tts_voice)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                settings.azure_tts_endpoint, content=ssml.encode("utf-8"), headers=headers
            )
    except httpx.HTTPError as exc:
        raise AzureTtsUpstreamError(f"Could not reach Azure TTS: {exc}") from exc

    if resp.status_code >= 400:
        raise AzureTtsUpstreamError(
            f"Azure TTS error {resp.status_code}: {resp.text[:300]}"
        )

    return resp.content
