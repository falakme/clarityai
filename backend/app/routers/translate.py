"""Core Crisis-to-Action translation endpoint."""

from fastapi import APIRouter, HTTPException

from app.schemas import TranslateRequest, TranslateResponse
from app.services.nvidia import (
    NvidiaConfigError,
    NvidiaUpstreamError,
    translate_form,
)

router = APIRouter(tags=["translate"])


@router.post("/api/translate-form", response_model=TranslateResponse)
async def translate(req: TranslateRequest) -> TranslateResponse:
    """Translate dense legal/government text into an actionable checklist.

    Human-in-the-loop: this endpoint NEVER submits anything on the user's
    behalf. It only extracts and summarizes.
    """
    try:
        return await translate_form(req.text)
    except NvidiaConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except NvidiaUpstreamError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
