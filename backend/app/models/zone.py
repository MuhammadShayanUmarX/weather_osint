"""Zone document model."""

from __future__ import annotations

from typing import Any

from pydantic import Field

from app.models.base import MongoDocument
from app.schemas.geo import ZoneGeometry
from app.utils.time import UTCDateTime


class Zone(MongoDocument):
    name: str
    slug: str
    zone_type: str
    country: str
    administrative_level: str | None = None
    geometry: ZoneGeometry
    area_km2: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: UTCDateTime
    updated_at: UTCDateTime
