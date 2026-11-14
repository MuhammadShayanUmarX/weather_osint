"""Zone service."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.models.zone import Zone
from app.repositories.observation_repository import ObservationRepository
from app.repositories.zone_repository import ZoneRepository
from app.schemas.common import build_pagination
from app.schemas.zone import (
    ZoneCreate,
    ZoneListResponse,
    ZoneObservationsResponse,
    ZoneRead,
)
from app.services.observation_service import observation_to_read
from app.utils.geo import geometry_area_km2
from app.utils.identifiers import slugify
from app.utils.time import ensure_utc, utc_now


def zone_to_read(document: dict[str, Any]) -> ZoneRead:
    model = Zone.model_validate(document)
    return ZoneRead.model_validate(model.model_dump())


class ZoneService:
    def __init__(
        self,
        repository: ZoneRepository | None = None,
        observation_repository: ObservationRepository | None = None,
    ) -> None:
        self.repository = repository or ZoneRepository()
        self.observation_repository = observation_repository or ObservationRepository()

    def list_zones(
        self,
        *,
        country: str | None = None,
        zone_type: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ZoneListResponse:
        documents, total = self.repository.list_zones(
            country=country,
            zone_type=zone_type,
            search=search,
            page=page,
            page_size=page_size,
        )
        return ZoneListResponse(
            items=[zone_to_read(document) for document in documents],
            pagination=build_pagination(page, page_size, total),
        )

    def get_zone(self, zone_id: str) -> ZoneRead:
        document = self.repository.get_by_id(zone_id)
        if document is None:
            raise NotFoundError(f"Zone '{zone_id}' was not found")
        return zone_to_read(document)

    def create_zone(self, payload: ZoneCreate) -> ZoneRead:
        slug = payload.slug or slugify(payload.name)
        if self.repository.slug_exists(slug):
            raise ConflictError(f"Zone slug '{slug}' already exists")

        geometry = payload.geometry.model_dump()
        now = utc_now()
        document = {
            "name": payload.name,
            "slug": slug,
            "zone_type": payload.zone_type,
            "country": payload.country,
            "administrative_level": payload.administrative_level,
            "geometry": geometry,
            "area_km2": (
                payload.area_km2
                if payload.area_km2 is not None
                else geometry_area_km2(geometry)
            ),
            "metadata": payload.metadata,
            "created_at": now,
            "updated_at": now,
        }

        try:
            stored = self.repository.insert(document)
        except DuplicateKeyError as exc:
            raise ConflictError(f"Zone slug '{slug}' already exists") from exc

        return zone_to_read(stored)

    def get_zone_observations(
        self,
        *,
        zone_id: str,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ZoneObservationsResponse:
        zone_document = self.repository.get_by_id(zone_id)
        if zone_document is None:
            raise NotFoundError(f"Zone '{zone_id}' was not found")

        start = ensure_utc(start_date) if start_date else None
        end = ensure_utc(end_date) if end_date else None
        if start and end and start > end:
            raise BadRequestError("start_date must be earlier than or equal to end_date")

        documents, total = self.observation_repository.list_observations(
            observation_type=observation_type,
            variable=variable,
            source_id=source_id,
            start_date=start,
            end_date=end,
            zone_geometry=zone_document["geometry"],
            page=page,
            page_size=page_size,
        )

        return ZoneObservationsResponse(
            zone_id=zone_id,
            zone_name=zone_document["name"],
            items=[observation_to_read(document) for document in documents],
            pagination=build_pagination(page, page_size, total),
        )
