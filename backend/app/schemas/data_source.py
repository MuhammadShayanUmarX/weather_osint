"""Data source API schemas.

No credential or secret field exists in this contract.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.models.enums import AccessType, SourceType
from app.schemas.common import PaginationMeta
from app.utils.time import UTCDateTime


class DataSourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="MongoDB ObjectId as a hexadecimal string.")
    name: str
    provider: str
    source_type: SourceType
    description: str
    website_url: str | None = None
    access_type: AccessType
    license: str | None = None
    attribution: str | None = None
    enabled: bool
    last_successful_sync: UTCDateTime | None = None
    last_error: str | None = None
    created_at: UTCDateTime
    updated_at: UTCDateTime

    @computed_field
    @property
    def sync_status(self) -> str:
        if not self.enabled:
            return "disabled"
        if self.last_error:
            return "error"
        if self.last_successful_sync:
            return "healthy"
        return "never_synced"


class DataSourceListResponse(BaseModel):
    items: list[DataSourceRead]
    pagination: PaginationMeta
