"""Observation service."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.observation import Observation
from app.repositories.observation_repository import ObservationRepository
from app.repositories.zone_repository import ZoneRepository
from app.schemas.common import PaginationMeta, build_pagination
from app.schemas.observation import (
    ObservationFeature,
    ObservationFeatureCollection,
    ObservationListResponse,
    ObservationRead,
)
from app.utils.geo import point_geometry
from app.utils.time import ensure_utc


def observation_to_read(document: dict[str, Any]) -> ObservationRead:
    model = Observation.model_validate(document)
    return ObservationRead.model_validate(model.model_dump())


def _validate_dates(
    start_date: datetime | None, end_date: datetime | None
) -> tuple[datetime | None, datetime | None]:
    start = ensure_utc(start_date) if start_date else None
    end = ensure_utc(end_date) if end_date else None
    if start and end and start > end:
        raise BadRequestError("start_date must be earlier than or equal to end_date")
    return start, end


def ensure_single_spatial_filter(
    bbox: tuple[float, float, float, float] | None,
    zone_id: str | None,
    near: tuple[float, float] | None,
) -> None:
    selected = sum(value is not None for value in (bbox, zone_id, near))
    if selected > 1:
        raise BadRequestError(
            "Use only one spatial filter at a time: bbox, zone_id, or near"
        )


def _validate_radius(radius_km: float) -> None:
    if radius_km <= 0 or radius_km > 20000:
        raise BadRequestError("radius_km must be greater than 0 and at most 20000")


class ObservationService:
    def __init__(
        self,
        repository: ObservationRepository | None = None,
        zone_repository: ZoneRepository | None = None,
    ) -> None:
        self.repository = repository or ObservationRepository()
        self.zone_repository = zone_repository or ZoneRepository()

    def _zone_geometry(self, zone_id: str | None) -> dict[str, Any] | None:
        if not zone_id:
            return None
        zone = self.zone_repository.get_by_id(zone_id)
        if zone is None:
            raise NotFoundError(f"Zone '{zone_id}' was not found")
        return zone["geometry"]

    def list_observations(
        self,
        *,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        zone_id: str | None = None,
        near: tuple[float, float] | None = None,
        radius_km: float = 50.0,
        page: int = 1,
        page_size: int = 20,
    ) -> ObservationListResponse:
        ensure_single_spatial_filter(bbox, zone_id, near)
        start, end = _validate_dates(start_date, end_date)
        if near:
            _validate_radius(radius_km)

        documents, total = self.repository.list_observations(
            observation_type=observation_type,
            variable=variable,
            source_id=source_id,
            start_date=start,
            end_date=end,
            bbox=bbox,
            zone_geometry=self._zone_geometry(zone_id),
            near=near,
            radius_km=radius_km,
            page=page,
            page_size=page_size,
        )
        pagination: PaginationMeta = build_pagination(page, page_size, total)
        return ObservationListResponse(
            items=[observation_to_read(document) for document in documents],
            pagination=pagination,
        )

    def get_observation(self, observation_id: str) -> ObservationRead:
        document = self.repository.get_by_id(observation_id)
        if document is None:
            raise NotFoundError(f"Observation '{observation_id}' was not found")
        return observation_to_read(document)

    def get_geojson(
        self,
        *,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        zone_id: str | None = None,
        near: tuple[float, float] | None = None,
        radius_km: float = 50.0,
        limit: int = 1000,
    ) -> ObservationFeatureCollection:
        ensure_single_spatial_filter(bbox, zone_id, near)
        start, end = _validate_dates(start_date, end_date)
        if near:
            _validate_radius(radius_km)
        if limit <= 0 or limit > 5000:
            raise BadRequestError("limit must be between 1 and 5000")

        documents = self.repository.find_geojson_observations(
            observation_type=observation_type,
            variable=variable,
            source_id=source_id,
            start_date=start,
            end_date=end,
            bbox=bbox,
            zone_geometry=self._zone_geometry(zone_id),
            near=near,
            radius_km=radius_km,
            limit=limit,
        )

        features: list[ObservationFeature] = []
        for document in documents:
            properties = {
                key: value
                for key, value in document.items()
                if key not in {"_id", "location"}
            }
            features.append(
                ObservationFeature(
                    id=str(document["_id"]),
                    geometry=point_geometry(
                        document["location"]["coordinates"][0],
                        document["location"]["coordinates"][1],
                    ),
                    properties=properties,
                )
            )

        return ObservationFeatureCollection(features=features)
