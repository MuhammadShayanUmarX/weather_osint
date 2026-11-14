"""Alert persistence and geographic intersection queries."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from bson import ObjectId
from pymongo import DESCENDING
from pymongo.database import Database

from app.core.database import get_database
from app.utils.identifiers import serialize_document, to_object_id


class AlertRepository:
    def __init__(self, database: Database | None = None) -> None:
        self._database = database

    @property
    def collection(self):
        return (self._database or get_database())["alerts"]

    def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        result = self.collection.insert_one(document)
        stored = dict(document)
        stored["_id"] = result.inserted_id
        return serialize_document(stored) or {}

    def get_by_id(self, alert_id: str | ObjectId) -> dict[str, Any] | None:
        document = self.collection.find_one({"_id": to_object_id(alert_id, "alert_id")})
        return serialize_document(document)

    def list_alerts(
        self,
        *,
        severity: str | None = None,
        alert_type: str | None = None,
        status: str | None = None,
        source_id: str | ObjectId | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        zone_geometry: dict[str, Any] | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[dict[str, Any]], int]:
        filters: dict[str, Any] = {}

        if severity:
            filters["severity"] = severity
        if alert_type:
            filters["alert_type"] = alert_type
        if status:
            filters["status"] = status
        if source_id:
            filters["source_id"] = to_object_id(source_id, "source_id")
        if start_date or end_date:
            date_filter: dict[str, datetime] = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            filters["start_time"] = date_filter
        if zone_geometry:
            filters["geometry"] = {
                "$geoIntersects": {
                    "$geometry": zone_geometry,
                }
            }

        total = self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort([("start_time", DESCENDING), ("_id", DESCENDING)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        documents = [serialize_document(document) or {} for document in cursor]
        return documents, total
