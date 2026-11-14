"""Alert API schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AlertStatus, AlertType, Severity
from app.schemas.common import PaginationMeta
from app.schemas.geo import AnyGeometry
from app.utils.time import UTCDateTime


class AlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="MongoDB ObjectId as a hexadecimal string.")
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


class AlertListResponse(BaseModel):
    items: list[AlertRead]
    pagination: PaginationMeta
