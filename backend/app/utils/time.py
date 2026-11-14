"""UTC timestamp helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_utc(value: datetime) -> datetime:
    """Require an explicit timezone and normalize it to UTC."""

    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(
            "Timestamp must include a timezone offset, for example "
            "2026-01-01T00:00:00Z."
        )
    return value.astimezone(timezone.utc)


UTCDateTime = Annotated[datetime, AfterValidator(ensure_utc)]


def build_datetime_filter(
    start: datetime | None,
    end: datetime | None,
    field: str,
) -> dict[str, datetime] | None:
    """Build a MongoDB range filter and validate the requested order."""

    if start is not None and end is not None and start > end:
        raise ValueError("start_date must be earlier than or equal to end_date")

    bounds: dict[str, datetime] = {}
    if start is not None:
        bounds["$gte"] = ensure_utc(start)
    if end is not None:
        bounds["$lte"] = ensure_utc(end)
    return bounds or None
