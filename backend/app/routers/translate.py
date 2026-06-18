"""Core Crisis-to-Action translation endpoints.

The work is split across TWO endpoints so neither request runs long enough to
hit a reverse-proxy / gateway timeout (which surfaces in the browser as a
502 Bad Gateway):

  POST /api/translate-form  — extract text, redact PII, ONE NVIDIA call that
                              classifies + summarizes + extracts. Fast.
  POST /api/recommend       — the agentic step: Brave retrieval + a SECOND
                              NVIDIA call that evaluates the hits and selects
                              one "Verified Local Support" resource. The client
                              fires this after the translation renders, so the
                              card streams in without blocking the result.

Neither endpoint ever submits anything on the user's behalf.
"""

from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import get_settings
from app.schemas import RecommendRequest, TranslateResponse, VerifiedResource
from app.services import brave
from app.services.extract import ExtractionError, extract_text
from app.services.pii import redact_pii
from app.services.nvidia import (
    BlurDetectedError,
    NvidiaConfigError,
    NvidiaUpstreamError,
    evaluate_resources,
    translate_form,
)

router = APIRouter(tags=["translate"])

# Document types the model knows how to translate (optional domain hint).
ALLOWED_DOC_TYPES = {"emergency", "general", "eviction", "housing", "school", "medical_bill"}


@router.post("/api/translate-form", response_model=TranslateResponse)
async def translate(
    text: Optional[str] = Form(default=None),
    doc_type: str = Form(default="general"),
    eli5: bool = Form(default=False),
    language: str = Form(default=""),
    file: Optional[UploadFile] = File(default=None),
) -> TranslateResponse:
    """Translate dense paperwork into an actionable, multi-capability workspace.

    Provide `text` OR a `file` (PDF/image). Returns the structured translation
    (classification + summary + extraction). The "Verified Local Support"
    recommendation is fetched separately via POST /api/recommend so this call
    stays fast. Human-in-the-loop: this endpoint NEVER submits anything.
    """
    settings = get_settings()
    if doc_type not in ALLOWED_DOC_TYPES:
        doc_type = "general"

    user_context = (text or "").strip()
    document_text = ""

    if file is not None:
        data = await file.read()
        max_bytes = settings.max_upload_mb * 1024 * 1024
        if len(data) == 0:
            raise HTTPException(status_code=422, detail="The uploaded file is empty.")
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max {settings.max_upload_mb} MB.",
            )
        try:
            document_text = extract_text(file.filename, file.content_type, data)
        except ExtractionError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not user_context and not document_text:
        raise HTTPException(
            status_code=422,
            detail="Tell us what you need help with, or upload a document to translate.",
        )

    # PII REDACTION LAYER: strip SSNs, emails, and phone numbers before anything is sent
    # to the model. Runs on BOTH the typed context and the extracted document.
    user_context, count_user = redact_pii(user_context)
    document_text, count_doc = redact_pii(document_text)
    pii_redacted_count = count_user + count_doc

    # AI step — classify + summarize + extract (single call, kept fast).
    try:
        result = await translate_form(
            document_text,
            doc_type,
            user_context=user_context,
            eli5=eli5,
            language=language,
        )
    except NvidiaConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except NvidiaUpstreamError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except BlurDetectedError as exc:
        raise HTTPException(status_code=422, detail="blur_detected")

    result.pii_redacted_count = pii_redacted_count
    return result



@router.post("/api/recommend", response_model=VerifiedResource)
async def recommend(payload: RecommendRequest) -> VerifiedResource:
    """Agentic resource recommendation: Brave retrieval + AI evaluation.

    Best-effort by design — returns empty fields (rather than an error) when
    Brave/NVIDIA are unconfigured, find nothing, or fail, so the client can
    simply omit the "Verified Local Support" card.
    """
    search_location = (payload.location or "").strip() or (payload.detected_location or "").strip()
    try:
        query = brave.build_recommendation_query(payload.document_category, search_location)
        hits = await brave.search(query)
        if not hits:
            return VerifiedResource()
        return await evaluate_resources(
            hits,
            document_brief=payload.plain_language_brief,
            document_category=payload.document_category,
        )
    except Exception:  # noqa: BLE001 - recommendations never raise to the client
        return VerifiedResource()
