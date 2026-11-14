"""Zone endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status

from app.api.dependencies import Pagination, enum_value, get_pagination
from app.models.enums import ObservationType
from app.schemas.common import ErrorResponse
from app.schemas.zone import (
    ZoneCreate,
    ZoneListResponse,
    ZoneObservationsResponse,
    ZoneRead,
)
from app.services.zone_service import ZoneService
from app.utils.identifiers import OBJECT_ID_PATTERN
from app.utils.time import UTCDateTime

router = APIRouter()

ZONE_ID_DESCRIPTION = "Zone MongoDB ObjectId (24 hexadecimal characters)."


@router.get(
    "",
    response_model=ZoneListResponse,
    summary="List zones",
    description=(
        "List zones with pagination, country filtering, zone-type filtering, "
        "and case-insensitive name search."
    ),
)
def list_zones(
    country: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=64,
            description="Exact country filter, case-insensitive.",
            examples=["IN"],
        ),
    ] = None,
    zone_type: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=50,
            description="Exact zone type filter, case-insensitive.",
            examples=["region"],
        ),
    ] = None,
    search: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=120,
            description="Case-insensitive substring search on the zone name.",
            examples=["asia"],
        ),
    ] = None,
    pagination: Pagination = Depends(get_pagination),
) -> ZoneListResponse:
    return ZoneService().list_zones(
        country=country,
        zone_type=zone_type,
        search=search,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.post(
    "",
    response_model=ZoneRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a zone",
    description=(
        "Create a zone with a validated GeoJSON Polygon or MultiPolygon. "
        "GeoJSON positions must be [longitude, latitude]. Area is computed "
        "when area_km2 is omitted."
    ),
    responses={
        409: {"model": ErrorResponse, "description": "Duplicate zone slug."},
        422: {"description": "Validation error."},
    },
)
def create_zone(payload: ZoneCreate) -> ZoneRead:
    return ZoneService().create_zone(payload)


@router.get(
    "/{zone_id}",
    response_model=ZoneRead,
    summary="Get a zone",
    description="Retrieve a single zone by its MongoDB ObjectId.",
    responses={404: {"model": ErrorResponse, "description": "Zone not found."}},
)
def get_zone(
    zone_id: Annotated[
        str,
        Path(pattern=OBJECT_ID_PATTERN, description=ZONE_ID_DESCRIPTION),
    ],
) -> ZoneRead:
    return ZoneService().get_zone(zone_id)


@router.get(
    "/{zone_id}/observations",
    response_model=ZoneObservationsResponse,
    summary="List observations inside a zone",
    description=(
        "Point-in-polygon query executed by MongoDB using $geoWithin against "
        "the zone geometry and the observations.location 2dsphere index."
    ),
    responses={404: {"model": ErrorResponse, "description": "Zone not found."}},
)
def list_zone_observations(
    zone_id: Annotated[
        str,
        Path(pattern=OBJECT_ID_PATTERN, description=ZONE_ID_DESCRIPTION),
    ],
    observation_type: Annotated[
        ObservationType | None,
        Query(description="Filter by observation category."),
    ] = None,
    variable: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=80,
            description="Exact measured variable.",
            examples=["pm25"],
        ),
    ] = None,
    source_id: Annotated[
        str | None,
        Query(
            pattern=OBJECT_ID_PATTERN,
            description="Data source ObjectId.",
        ),
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
) -> ZoneObservationsResponse:
    return ZoneService().get_zone_observations(
        zone_id=zone_id,
        observation_type=enum_value(observation_type),
        variable=variable,
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
        page=pagination.page,
        page_size=pagination.page_size,
    )
