"""FastAPI application entry point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from app.api.endpoints import health
from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import close_mongo, initialize_database
from app.core.exceptions import ServiceError
from app.core.logging import configure_logging

logger = logging.getLogger(__name__)

OPENAPI_TAGS = [
    {
        "name": "Health",
        "description": "Process liveness checks.",
    },
    {
        "name": "System",
        "description": "API, MongoDB connectivity, and database status.",
    },
    {
        "name": "Zones",
        "description": (
            "GeoJSON zones, spatial indexes, and point-in-polygon observation "
            "queries."
        ),
    },
    {
        "name": "Observations",
        "description": (
            "Environmental observations with bounding-box, zone, nearby, and "
            "GeoJSON queries."
        ),
    },
    {
        "name": "Alerts",
        "description": (
            "Environmental alerts with severity, status, time, and geographic "
            "intersection filters."
        ),
    },
    {
        "name": "Data Sources",
        "description": (
            "Source metadata and synchronization status. Credentials are never "
            "exposed."
        ),
    },
]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    logger.info("Starting %s %s", settings.app_name, settings.app_version)
    initialize_database(settings)
    try:
        yield
    finally:
        close_mongo()
        logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Environmental Intelligence OSINT API backed by MongoDB Community "
            "Edition. GeoJSON coordinate order is always [longitude, latitude]. "
            "Spatial filtering is performed by MongoDB 2dsphere indexes using "
            "$geoWithin, $geoIntersects, $near, and $geoNear."
        ),
        lifespan=lifespan,
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url="/redoc" if settings.docs_enabled else None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
        openapi_tags=OPENAPI_TAGS,
        contact={
            "name": "Environmental Intelligence OSINT",
        },
        license_info={"name": "Open source"},
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", include_in_schema=False)
    def root() -> dict[str, Any]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "openapi": "/openapi.json",
            "health": "/health",
            "api": settings.api_v1_prefix,
        }

    @app.exception_handler(ServiceError)
    async def service_error_handler(
        _request: Request,
        exc: ServiceError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message, "code": exc.code},
        )

    @app.exception_handler(PyMongoError)
    async def pymongo_error_handler(
        _request: Request,
        exc: PyMongoError,
    ) -> JSONResponse:
        logger.exception("MongoDB operation failed", exc_info=exc)
        return JSONResponse(
            status_code=503,
            content={
                "detail": "MongoDB operation failed. Please retry shortly.",
                "code": "database_error",
            },
        )

    return app


app = create_app()
