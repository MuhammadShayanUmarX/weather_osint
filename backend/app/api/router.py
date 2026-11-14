"""Versioned API router composition."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.endpoints import alerts, health, observations, sources, zones

api_router = APIRouter()
api_router.include_router(health.system_router, prefix="/system", tags=["System"])
api_router.include_router(zones.router, prefix="/zones", tags=["Zones"])
api_router.include_router(
    observations.router,
    prefix="/observations",
    tags=["Observations"],
)
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(sources.router, prefix="/sources", tags=["Data Sources"])
