"""Observation document model."""

from __future__ import annotations

from typing import Any

from pydantic import Field

from app.models.base import MongoDocument
from app.models.enums import ObservationType, QualityStatus
from app.schemas.geo import PointGeometry
from app.utils.time import UTCDateTime


class Observation(MongoDocument):
    source_id: str
    observation_type: ObservationType
    variable: str
    value: float
    unit: str
    observed_at: UTCDateTime
    received_at: UTCDateTime
    location: PointGeometry
    location_name: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    quality_status: QualityStatus = QualityStatus.PROVISIONAL
    distance_m: float | None = None
