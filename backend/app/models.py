"""ORM models.

Only non-PII disaster alert data is stored. No user names, addresses, IDs,
or form contents are ever persisted here.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Alert(Base):
    """A mocked, non-personal disaster / aid-availability alert."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Geographic targeting by area (non-PII, public information). We target by
    # city/region/country derived from coarse geolocation — never by exact
    # coordinates or any personal address.
    city: Mapped[str] = mapped_column(String(120), index=True, default="")
    region: Mapped[str] = mapped_column(String(120), default="")
    country: Mapped[str] = mapped_column(String(120), default="")
    # Optional, legacy ZIP targeting (kept for backward compatibility).
    zip_code: Mapped[str] = mapped_column(String(16), index=True, default="")

    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)

    # info | warning | success
    severity: Mapped[str] = mapped_column(String(20), default="info")

    # Number of aid programs newly open (for the dashboard banner).
    programs_open: Mapped[int] = mapped_column(Integer, default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
