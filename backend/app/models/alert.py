"""Alert document model."""

from __future__ import annotations

from app.models.base import MongoDocument
from app.models.enums import AlertStatus, AlertType, Severity
from app.schemas.geo import AnyGeometry
from app.utils.time import UTCDateTime


class Alert(MongoDocument):
    title: str
    description: str
    alert_type: AlertType
    severity: Severity
    status: AlertStatus
    source_id: str
    geometry: AnyGeometry
    start_time: UTCDateTime
    end_time: UTCDateTime | None = None
    created_at: UTCDateTime
    updated_at: UTCDateTime
