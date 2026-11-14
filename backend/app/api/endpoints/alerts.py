"""Alert endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query

from app.api.dependencies import Pagination, enum_value, get_pagination
from app.models.enums import AlertStatus, AlertType, Severity
from app.schemas.alert import AlertListResponse, AlertRead
from app.schemas.common import ErrorResponse
from app.services.alert_service import AlertService
from app.utils.identifiers import OBJECT_ID_PATTERN
from app.utils.time import UTCDateTime

router = APIRouter()

ALERT_ID_DESCRIPTION = "Alert MongoDB ObjectId (24 hexadecimal characters)."


@router.get(
    "",
    response_model=AlertListResponse,
    summary="List alerts",
    description=(
        "Filter alerts by severity, type, status, source, start_time range, "
        "or zone. Zone filtering uses MongoDB $geoIntersects against the "
        "alerts.geometry 2dsphere index."
    ),
)
def list_alerts(
    severity: Annotated[
        Severity | None,
        Query(description="Alert severity."),
    ] = None,
    alert_type: Annotated[
        AlertType | None,
        Query(description="Alert category."),
    ] = None,
    status: Annotated[
        AlertStatus | None,
        Query(description="Alert lifecycle status."),
    ] = None,
    source_id: Annotated[
        str | None,
        Query(pattern=OBJECT_ID_PATTERN, description="Data source ObjectId."),
    ] = None,
    start_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive lower bound on start_time (UTC)."),
    ] = None,
    end_date: Annotated[
        UTCDateTime | None,
        Query(description="Inclusive upper bound on start_time (UTC)."),
    ] = None,
    zone_id: Annotated[
        str | None,
        Query(
            pattern=OBJECT_ID_PATTERN,
            description="Only alerts whose geometry intersects this zone.",
        ),
    ] = None,
    pagination: Pagination = Depends(get_pagination),
) -> AlertListResponse:
    return AlertService().list_alerts(
        severity=enum_value(severity),
        alert_type=enum_value(alert_type),
        status=enum_value(status),
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
        zone_id=zone_id,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get(
    "/{alert_id}",
    response_model=AlertRead,
    summary="Get an alert",
    description="Retrieve one alert by MongoDB ObjectId.",
    responses={404: {"model": ErrorResponse, "description": "Alert not found."}},
)
def get_alert(
    alert_id: Annotated[
        str,
        Path(pattern=OBJECT_ID_PATTERN, description=ALERT_ID_DESCRIPTION),
    ],
) -> AlertRead:
    return AlertService().get_alert(alert_id)
