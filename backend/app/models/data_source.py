"""Data source document model.

Credential fields are intentionally absent. Secrets belong in environment
variables or a dedicated secret manager, never in MongoDB records.
"""

from __future__ import annotations

from app.models.base import MongoDocument
from app.models.enums import AccessType, SourceType
from app.utils.time import UTCDateTime


class DataSource(MongoDocument):
    name: str
    provider: str
    source_type: SourceType
    description: str
    website_url: str | None = None
    access_type: AccessType
    license: str | None = None
    attribution: str | None = None
    enabled: bool = True
    last_successful_sync: UTCDateTime | None = None
    last_error: str | None = None
    created_at: UTCDateTime
    updated_at: UTCDateTime
