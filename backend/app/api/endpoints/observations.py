"""Observation endpoints, including GeoJSON and nearby searches."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query

from app.api.dependencies import (
    Pagination,
    enum_value,
    get_pagination,
    parse_bbox_param,
    parse_near_param,
)
from app.models.enums import ObservationType
from app.schemas.common import ErrorResponse
from app.schemas.observation import (
    ObservationFeatureCollection,
    ObservationListResponse,
    ObservationRead,
)
from app.services.observation_service import ObservationService
from app.utils.identifiers import OBJECT_ID_PATTERN
from app.utils.time import UTCDateTime

router = APIRouter()

OBSERVATION_ID_DESCRIPTION = (
    "Observation MongoDB ObjectId (24 hexadecimal characters)."
)

SPATIAL_DESCRIPTION = (
    "Use at most one of bbox, zone_id, or near per request."
)


@router.get(
    "/geojson",
    response_model=ObservationFeatureCollection,
    summary="Export observations as GeoJSON",
    description=(
        "Return a valid GeoJSON FeatureCollection of observation points. "
        "Supports the same filters as the list endpoint plus a result limit. "
        "When near is supplied, MongoDB $near is used; otherwise $geoWithin "
        "handles bounding boxes and zones."
    ),
)
def observations_geojson(
    observation_type: Annotated[
        ObservationType | None,
        Query(description="Filter by observation category."),
    ] = None,
    variable: Annotated[
        str | None,
        Query(min_length=1, max_length=80, description="Exact measured variable."),
    ] = None,
    source_id: Annotated[
        str | None,
        Query(pattern=OBJECT_ID_PATTERN, description="Data source ObjectId."),
    ] = None,
    start_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive lower bound on observed_at (UTC)."),
    ] = None,
    end_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive upper bound on observed_at (UTC)."),
    ] = None,
    bbox: Annotated[
        str | None,
        Query(
            description="Bounding box min_lon,min_lat,max_lon,max_lat.",
            examples=["72.0,18.0,78.0,24.0"],
        ),
    ] = None,
    zone_id: Annotated[
        str | None,
        Query(
            pattern=OBJECT_ID_PATTERN,
            description="Only observations inside this zone geometry.",
        ),
    ] = None,
    near: Annotated[
        str | None,
        Query(
            description="Nearby search point longitude,latitude.",
            examples=["77.209,28.6139"],
        ),
    ] = None,
    radius_km: Annotated[
        float,
        Query(gt=0, le=20000, description="Nearby search radius in kilometres."),
    ] = 50.0,
    limit: Annotated[
        int,
        Query(ge=1, le=5000, description="Maximum features to return."),
    ] = 1000,
) -> ObservationFeatureCollection:
    return ObservationService().get_geojson(
        observation_type=enum_value(observation_type),
        variable=variable,
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
        bbox=parse_bbox_param(bbox),
        zone_id=zone_id,
        near=parse_near_param(near),
        radius_km=radius_km,
        limit=limit,
    )


@router.get(
    "/nearby",
    response_model=ObservationListResponse,
    summary="Find nearby observations",
    description=(
        "Return observations ordered by distance from a longitude/latitude point. "
        "MongoDB $geoNear supplies distance_m and the total count."
    ),
)
def nearby_observations(
    lon: Annotated[
        float,
        Query(ge=-180, le=180, description="Longitude in decimal degrees."),
    ],
    lat: Annotated[
        float,
        Query(ge=-90, le=90, description="Latitude in decimal degrees."),
    ],
    radius_km: Annotated[
        float,
        Query(gt=0, le=20000, description="Search radius in kilometres."),
    ] = 50.0,
    observation_type: Annotated[
        ObservationType | None,
        Query(description="Filter by observation category."),
    ] = None,
    variable: Annotated[
        str | None,
        Query(min_length=1, max_length=80, description="Exact measured variable."),
    ] = None,
    source_id: Annotated[
        str | None,
        Query(pattern=OBJECT_ID_PATTERN, description="Data source ObjectId."),
    ] = None,
    start_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive lower bound on observed_at (UTC)."),
    ] = None,
    end_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive upper bound on observed_at (UTC)."),
    ] = None,
    pagination: Pagination = Depends(get_pagination),
) -> ObservationListResponse:
    return ObservationService().list_observations(
        observation_type=enum_value(observation_type),
        variable=variable,
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
        near=(lon, lat),
        radius_km=radius_km,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get(
    "",
    response_model=ObservationListResponse,
    summary="List observations",
    description=(
        "Filter observations by type, variable, source, observed_at range, "
        "bounding box, zone, or proximity. " + SPATIAL_DESCRIPTION
    ),
)
def list_observations(
    observation_type: Annotated[
        ObservationType | None,
        Query(description="Filter by observation category."),
    ] = None,
    variable: Annotated[
        str | None,
        Query(min_length=1, max_length=80, description="Exact measured variable."),
    ] = None,
    source_id: Annotated[
        str | None,
        Query(pattern=OBJECT_ID_PATTERN, description="Data source ObjectId."),
    ] = None,
    start_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive lower bound on observed_at (UTC)."),
    ] = None,
    end_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive upper bound on observed_at (UTC)."),
    ] = None,
    bbox: Annotated[
        str | None,
        Query(
            description="Bounding box min_lon,min_lat,max_lon,max_lat.",
            examples=["72.0,18.0,78.0,24.0"],
        ),
    ] = None,
    zone_id: Annotated[
        str | None,
        Query(
            pattern=OBJECT_ID_PATTERN,
            description="Only observations inside this zone geometry.",
        ),
    ] = None,
    near: Annotated[
        str | None,
        Query(
            description="Nearby search point longitude,latitude.",
            examples=["77.209,28.6139"],
        ),
    ] = None,
    radius_km: Annotated[
        float,
        Query(gt=0, le=20000, description="Nearby search radius in kilometres."),
    ] = 50.0,
    pagination: Pagination = Depends(get_pagination),
) -> ObservationListResponse:
    return ObservationService().list_observations(
        observation_type=enum_value(observation_type),
        variable=variable,
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
        bbox=parse_bbox_param(bbox),
        zone_id=zone_id,
        near=parse_near_param(near),
        radius_km=radius_km,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get(
    "/{observation_id}",
    response_model=ObservationRead,
    summary="Get an observation",
    description="Retrieve one observation by MongoDB ObjectId.",
    responses={404: {"model": ErrorResponse, "description": "Observation not found."}},
)
def get_observation(
    observation_id: Annotated[
        str,
        Path(
            pattern=OBJECT_ID_PATTERN,
            description=OBSERVATION_ID_DESCRIPTION,
        ),
    ],
) -> ObservationRead:
    return ObservationService().get_observation(observation_id)
