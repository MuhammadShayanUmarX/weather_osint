"""Health and system status endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.database import check_mongodb_connection
from app.utils.time import utc_now

router = APIRouter()
system_router = APIRouter()


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    application: str
    application_version: str
    timestamp: datetime


class SystemStatusResponse(BaseModel):
    status: Literal["ok", "degraded"]
    api_status: Literal["ok", "degraded"]
    mongodb_status: Literal["connected", "disconnected"]
    database_name: str = Field(description="Configured MongoDB database name.")
    application_version: str
    environment: str
    timestamp: datetime


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Liveness check",
    description="Returns API process health. This endpoint does not require MongoDB.",
)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        application=settings.app_name,
        application_version=settings.app_version,
        timestamp=utc_now(),
    )


@system_router.get(
    "/status",
    response_model=SystemStatusResponse,
    tags=["System"],
    summary="System and database status",
    description=(
        "Reports API status, live MongoDB connectivity, the configured database "
        "name, application version, and environment."
    ),
)
def system_status() -> SystemStatusResponse:
    settings = get_settings()
    connected, _error = check_mongodb_connection()
    api_status: Literal["ok", "degraded"] = "ok" if connected else "degraded"

    return SystemStatusResponse(
        status=api_status,
        api_status=api_status,
        mongodb_status="connected" if connected else "disconnected",
        database_name=settings.mongodb_database,
        application_version=settings.app_version,
        environment=settings.environment,
        timestamp=utc_now(),
    )
