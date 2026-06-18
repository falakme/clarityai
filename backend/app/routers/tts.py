"""Text-to-Speech endpoint (Microsoft Azure Cognitive Services proxy).

POST /api/tts  — synthesize a neutral English neural voice for the supplied
                 text and stream back MP3 audio. English-only by design.

Returns HTTP 503 when AZURE_TTS_KEY is not configured so the frontend can fall
back to the browser's built-in Web Speech synthesis; 502 on upstream failure.
Like the rest of ClarityAI, this endpoint is stateless and persists nothing.
"""

from fastapi import APIRouter, HTTPException, Response

from app.schemas import TtsRequest
from app.services.azure_tts import (
    AzureTtsConfigError,
    AzureTtsUpstreamError,
    synthesize_speech,
)

router = APIRouter(tags=["tts"])


@router.post("/api/tts")
async def tts(payload: TtsRequest) -> Response:
    """Synthesize speech audio (MP3) from text using Azure neural TTS."""
    try:
        audio = await synthesize_speech(payload.text)
    except AzureTtsConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AzureTtsUpstreamError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )
