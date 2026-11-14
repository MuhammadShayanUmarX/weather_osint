"""Alert service."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.alert import Alert
from app.repositories.alert_repository import AlertRepository
from app.repositories.zone_repository import ZoneRepository
from app.schemas.alert import AlertListResponse, AlertRead
from app.schemas.common import build_pagination
from app.utils.time import ensure_utc


def alert_to_read(document: dict[str, Any]) -> AlertRead:
    model = Alert.model_validate(document)
    return AlertRead.model_validate(model.model_dump())


class AlertService:
    def __init__(
        self,
        repository: AlertRepository | None = None,
        zone_repository: ZoneRepository | None = None,
    ) -> None:
        self.repository = repository or AlertRepository()
        self.zone_repository = zone_repository or ZoneRepository()

    def list_alerts(
        self,
        *,
        severity: str | None = None,
        alert_type: str | None = None,
        status: str | None = None,
        source_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        zone_id: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> AlertListResponse:
        start = ensure_utc(start_date) if start_date else None
        end = ensure_utc(end_date) if end_date else None
        if start and end and start > end:
            raise BadRequestError("start_date must be earlier than or equal to end_date")

        zone_geometry = None
        if zone_id:
            zone = self.zone_repository.get_by_id(zone_id)
            if zone is None:
                raise NotFoundError(f"Zone '{zone_id}' was not found")
            zone_geometry = zone["geometry"]

        documents, total = self.repository.list_alerts(
            severity=severity,
            alert_type=alert_type,
            status=status,
            source_id=source_id,
            start_date=start,
            end_date=end,
            zone_geometry=zone_geometry,
            page=page,
            page_size=page_size,
        )
        return AlertListResponse(
            items=[alert_to_read(document) for document in documents],
            pagination=build_pagination(page, page_size, total),
        )

    def get_alert(self, alert_id: str) -> AlertRead:
        document = self.repository.get_by_id(alert_id)
        if document is None:
            raise NotFoundError(f"Alert '{alert_id}' was not found")
        return alert_to_read(document)
