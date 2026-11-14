"""Zone API schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import PaginationMeta
from app.schemas.geo import PolygonExample, ZoneGeometry
from app.schemas.observation import ObservationRead
from app.utils.time import UTCDateTime

ZONE_TYPE_PATTERN = r"^[a-z][a-z0-9_]{1,49}$"
SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"

ZONE_CREATE_EXAMPLE = {
    "name": "South Asia",
    "slug": "south-asia",
    "zone_type": "region",
    "country": "IN",
    "administrative_level": "regional",
    "geometry": PolygonExample,
    "metadata": {"description": "Demonstration operational region"},
}


class ZoneCreate(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={"examples": [ZONE_CREATE_EXAMPLE]},
    )

    name: str = Field(
        min_length=2,
        max_length=120,
        description="Human-readable zone name.",
        examples=["South Asia"],
    )
    slug: str | None = Field(
        default=None,
        pattern=SLUG_PATTERN,
        description=(
            "URL-safe unique slug. Generated from the name when omitted."
        ),
        examples=["south-asia"],
    )
    zone_type: str = Field(
        default="custom",
        pattern=ZONE_TYPE_PATTERN,
        description="Zone category such as country, region, watershed, or custom.",
        examples=["region"],
    )
    country: str = Field(
        min_length=2,
        max_length=64,
        description="Country name or ISO-like code.",
        examples=["IN"],
    )
    administrative_level: str | None = Field(
        default=None,
        max_length=80,
        description="Optional administrative level label.",
        examples=["regional"],
    )
    geometry: ZoneGeometry = Field(
        description="GeoJSON Polygon or MultiPolygon. Coordinates are [longitude, latitude].",
    )
    area_km2: float | None = Field(
        default=None,
        ge=0,
        description="Optional area in square kilometres. Computed when omitted.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Free-form metadata. Do not store secrets.",
    )

    @field_validator("name", "country", "zone_type")
    @classmethod
    def _strip_required_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("value must not be blank")
        return stripped

    @field_validator("administrative_level")
    @classmethod
    def _strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ZoneRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="MongoDB ObjectId as a 24-character hexadecimal string.")
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


class ZoneListResponse(BaseModel):
    items: list[ZoneRead]
    pagination: PaginationMeta


class ZoneObservationsResponse(BaseModel):
    zone_id: str
    zone_name: str
    items: list[ObservationRead]
    pagination: PaginationMeta
