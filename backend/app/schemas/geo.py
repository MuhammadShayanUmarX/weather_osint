"""Validated GeoJSON geometry schemas.

All positions are ``[longitude, latitude]``. Longitude is validated before
latitude so inverted coordinates are rejected with a clear error.
"""

from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.geo import (
    validate_multipolygon_coordinates,
    validate_polygon_coordinates,
    validate_position,
)

PointExample = {
    "type": "Point",
    "coordinates": [77.209, 28.6139],
}

PolygonExample = {
    "type": "Polygon",
    "coordinates": [
        [
            [68.0, 6.0],
            [98.0, 6.0],
            [98.0, 36.0],
            [68.0, 36.0],
            [68.0, 6.0],
        ]
    ],
}

MultiPolygonExample = {
    "type": "MultiPolygon",
    "coordinates": [
        [
            [
                [68.0, 6.0],
                [98.0, 6.0],
                [98.0, 36.0],
                [68.0, 36.0],
                [68.0, 6.0],
            ]
        ]
    ],
}


class PointGeometry(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"examples": [PointExample]},
    )

    type: Literal["Point"] = "Point"
    coordinates: list[float] = Field(
        description="Point position as [longitude, latitude].",
        examples=[[77.209, 28.6139]],
    )

    @field_validator("coordinates")
    @classmethod
    def _validate_coordinates(cls, value: list[float]) -> list[float]:
        validate_position(value)
        return [float(value[0]), float(value[1])]


class LineStringGeometry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["LineString"] = "LineString"
    coordinates: list[list[float]] = Field(
        description="Ordered positions as [[longitude, latitude], ...]."
    )

    @field_validator("coordinates")
    @classmethod
    def _validate_coordinates(cls, value: list[list[float]]) -> list[list[float]]:
        if len(value) < 2:
            raise ValueError("A LineString must contain at least two positions")
        for position in value:
            validate_position(position)
        return value


class PolygonGeometry(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"examples": [PolygonExample]},
    )

    type: Literal["Polygon"] = "Polygon"
    coordinates: list[list[list[float]]] = Field(
        description=(
            "Array of linear rings. Each ring is a closed array of "
            "[longitude, latitude] positions."
        )
    )

    @field_validator("coordinates")
    @classmethod
    def _validate_coordinates(
        cls, value: list[list[list[float]]]
    ) -> list[list[list[float]]]:
        validate_polygon_coordinates(value)
        return value


class MultiPolygonGeometry(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={"examples": [MultiPolygonExample]},
    )

    type: Literal["MultiPolygon"] = "MultiPolygon"
    coordinates: list[list[list[list[float]]]] = Field(
        description="Array of Polygon coordinate arrays."
    )

    @field_validator("coordinates")
    @classmethod
    def _validate_coordinates(
        cls, value: list[list[list[list[float]]]]
    ) -> list[list[list[list[float]]]]:
        validate_multipolygon_coordinates(value)
        return value


ZoneGeometry = Annotated[
    Union[PolygonGeometry, MultiPolygonGeometry],
    Field(discriminator="type"),
]

AnyGeometry = Annotated[
    Union[
        PointGeometry,
        LineStringGeometry,
        PolygonGeometry,
        MultiPolygonGeometry,
    ],
    Field(discriminator="type"),
]
