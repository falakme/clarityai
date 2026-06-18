"""PII redaction.

Runs on extracted/typed text BEFORE it is sent to the NVIDIA model, so
sensitive identifiers never leave the backend. Currently redacts US Social
Security Numbers; the pattern set can be extended without touching callers.

PRIVACY: redaction is in-memory only; nothing is logged or persisted.
"""

from __future__ import annotations

import re

REDACTED = "[REDACTED]"

# US SSN: XXX-XX-XXXX (also tolerates spaces as separators). Word boundaries
# avoid clipping longer digit runs (e.g. phone numbers / IDs).
_SSN_RE = re.compile(r"\b\d{3}[-\s]\d{2}[-\s]\d{4}\b")

# General email pattern
_EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")

# General phone number pattern supporting various international and US layouts
_PHONE_RE = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")


def redact_pii(text: str) -> tuple[str, int]:
    """Replace recognised PII (SSNs, emails, phone numbers) with a [REDACTED] placeholder.

    Returns:
        A tuple of (redacted_text, count_of_redactions)
    """
    if not text:
        return text, 0

    count = 0

    # 1. Emails
    text, n_email = _EMAIL_RE.subn(REDACTED, text)
    count += n_email

    # 2. SSNs
    text, n_ssn = _SSN_RE.subn(REDACTED, text)
    count += n_ssn

    # 3. Phone numbers
    text, n_phone = _PHONE_RE.subn(REDACTED, text)
    count += n_phone

    return text, count

