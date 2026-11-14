"""GeoJSON validation and geodesic helpers.

GeoJSON coordinate order is always ``[longitude, latitude]``.
"""

from __future__ import annotations

import math
from typing import Any, Sequence

EARTH_RADIUS_KM = 6371.0088


def validate_longitude(value: float) -> None:
    if not math.isfinite(value) or value < -180.0 or value > 180.0:
        raise ValueError(
            "longitude must be a finite number between -180 and 180; "
            "GeoJSON positions are [longitude, latitude]"
        )


def validate_latitude(value: float) -> None:
    if not math.isfinite(value) or value < -90.0 or value > 90.0:
        raise ValueError(
            "latitude must be a finite number between -90 and 90; "
            "GeoJSON positions are [longitude, latitude]"
        )


def validate_position(position: Sequence[float]) -> None:
    if not isinstance(position, (list, tuple)) or len(position) != 2:
        raise ValueError(
            "Each GeoJSON position must contain exactly two numbers: "
            "[longitude, latitude]"
        )
    longitude = float(position[0])
    latitude = float(position[1])
    validate_longitude(longitude)
    validate_latitude(latitude)


def validate_linear_ring(ring: Sequence[Sequence[float]]) -> None:
    if not isinstance(ring, (list, tuple)) or len(ring) < 4:
        raise ValueError(
            "A polygon ring must contain at least four positions, "
            "including the repeated first position"
        )

    for position in ring:
        validate_position(position)

    first = tuple(float(value) for value in ring[0])
    last = tuple(float(value) for value in ring[-1])
    if first != last:
        raise ValueError(
            "A polygon ring must be closed: the first and last positions must match"
        )

    distinct = {tuple(float(value) for value in position) for position in ring}
    if len(distinct) < 3:
        raise ValueError("A polygon ring must contain at least three distinct positions")


def validate_polygon_coordinates(
    coordinates: Sequence[Sequence[Sequence[float]]],
) -> None:
    if not isinstance(coordinates, (list, tuple)) or not coordinates:
        raise ValueError("A Polygon must contain at least one linear ring")

    for ring in coordinates:
        validate_linear_ring(ring)

    if abs(ring_signed_area(coordinates[0])) == 0.0:
        raise ValueError("The Polygon exterior ring must enclose a non-zero area")


def validate_multipolygon_coordinates(
    coordinates: Sequence[Sequence[Sequence[Sequence[float]]]],
) -> None:
    if not isinstance(coordinates, (list, tuple)) or not coordinates:
        raise ValueError("A MultiPolygon must contain at least one Polygon")

    for polygon in coordinates:
        validate_polygon_coordinates(polygon)


def ring_signed_area(ring: Sequence[Sequence[float]]) -> float:
    """Spherical shoelace area in square kilometres (signed)."""

    total = 0.0
    for first, second in zip(ring, ring[1:]):
        lon1 = math.radians(float(first[0]))
        lon2 = math.radians(float(second[0]))
        lat1 = math.radians(float(first[1]))
        lat2 = math.radians(float(second[1]))
        total += (lon2 - lon1) * (2.0 + math.sin(lat1) + math.sin(lat2))
    return total * (EARTH_RADIUS_KM**2) / 2.0


def ring_area_km2(ring: Sequence[Sequence[float]]) -> float:
    return abs(ring_signed_area(ring))


def geometry_area_km2(geometry: dict[str, Any]) -> float:
    """Compute an approximate geodesic area for Polygon/MultiPolygon geometry."""

    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates")

    if geometry_type == "Polygon":
        polygons = [coordinates]
    elif geometry_type == "MultiPolygon":
        polygons = coordinates
    else:
        raise ValueError("area_km2 is only supported for Polygon or MultiPolygon")

    total = 0.0
    for polygon in polygons:
        if not polygon:
            continue
        total += ring_area_km2(polygon[0])
        for hole in polygon[1:]:
            total -= ring_area_km2(hole)
    return round(max(total, 0.0), 6)


def parse_bbox(value: str) -> tuple[float, float, float, float]:
    """Parse ``min_lon,min_lat,max_lon,max_lat``."""

    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 4 or any(not part for part in parts):
        raise ValueError(
            "bbox must contain four comma-separated values: "
            "min_lon,min_lat,max_lon,max_lat"
        )

    try:
        min_lon, min_lat, max_lon, max_lat = (float(part) for part in parts)
    except ValueError as exc:
        raise ValueError("bbox values must be numeric") from exc

    validate_longitude(min_lon)
    validate_longitude(max_lon)
    validate_latitude(min_lat)
    validate_latitude(max_lat)

    if min_lon >= max_lon:
        raise ValueError(
            "bbox min_lon must be less than max_lon; antimeridian-crossing "
            "boxes are not supported"
        )
    if min_lat >= max_lat:
        raise ValueError("bbox min_lat must be less than max_lat")

    return min_lon, min_lat, max_lon, max_lat


def parse_point(value: str, parameter_name: str = "near") -> tuple[float, float]:
    """Parse a ``longitude,latitude`` point."""

    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 2 or any(not part for part in parts):
        raise ValueError(
            f"{parameter_name} must contain two comma-separated values: "
            "longitude,latitude"
        )

    try:
        longitude, latitude = (float(part) for part in parts)
    except ValueError as exc:
        raise ValueError(f"{parameter_name} values must be numeric") from exc

    validate_longitude(longitude)
    validate_latitude(latitude)
    return longitude, latitude


def point_geometry(longitude: float, latitude: float) -> dict[str, Any]:
    validate_longitude(longitude)
    validate_latitude(latitude)
    return {"type": "Point", "coordinates": [longitude, latitude]}


def bbox_geometry(
    min_lon: float,
    min_lat: float,
    max_lon: float,
    max_lat: float,
) -> dict[str, Any]:
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat],
            ]
        ],
    }
