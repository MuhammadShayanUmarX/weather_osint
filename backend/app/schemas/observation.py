"""Observation API schemas and GeoJSON response models."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import ObservationType, QualityStatus
from app.schemas.common import PaginationMeta
from app.schemas.geo import PointExample, PointGeometry
from app.utils.time import UTCDateTime


class ObservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="MongoDB ObjectId as a hexadecimal string.")
    source_id: str = Field(description="Data source ObjectId as a hexadecimal string.")
    observation_type: ObservationType
    variable: str
    value: float
    unit: str
    observed_at: UTCDateTime
    received_at: UTCDateTime
    location: PointGeometry
    location_name: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    quality_status: QualityStatus
    distance_m: float | None = Field(
        default=None,
        description="Distance from the near query point, in metres.",
    )

    @field_validator("value")
    @classmethod
    def _validate_value(cls, value: float) -> float:
        import math

        if not math.isfinite(value):
            raise ValueError("value must be a finite number")
        return value


class ObservationListResponse(BaseModel):
    items: list[ObservationRead]
    pagination: PaginationMeta


class ObservationFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    id: str
    geometry: PointGeometry
    properties: dict[str, Any] = Field(default_factory=dict)


class ObservationFeatureCollection(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "id": "65f1c2a9b8f1a2c3d4e5f678",
                            "geometry": PointExample,
                            "properties": {
                                "observation_type": "air_quality",
                                "variable": "pm25",
                                "value": 42.5,
                                "unit": "ug/m3",
                                "observed_at": "2026-01-01T00:00:00Z",
                                "quality_status": "verified",
                            },
                        }
                    ],
                }
            ]
        }
    )

    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[ObservationFeature]
