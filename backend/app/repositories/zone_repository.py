"""Zone persistence and query operations."""

from __future__ import annotations

import re
from typing import Any

from bson import ObjectId
from pymongo.database import Database

from app.core.database import get_database
from app.utils.identifiers import serialize_document, to_object_id


class ZoneRepository:
    def __init__(self, database: Database | None = None) -> None:
        self._database = database

    @property
    def collection(self):
        return (self._database or get_database())["zones"]

    def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        result = self.collection.insert_one(document)
        stored = dict(document)
        stored["_id"] = result.inserted_id
        return serialize_document(stored) or {}

    def get_by_id(self, zone_id: str | ObjectId) -> dict[str, Any] | None:
        document = self.collection.find_one({"_id": to_object_id(zone_id, "zone_id")})
        return serialize_document(document)

    def get_by_slug(self, slug: str) -> dict[str, Any] | None:
        document = self.collection.find_one({"slug": slug})
        return serialize_document(document)

    def slug_exists(self, slug: str) -> bool:
        return self.collection.count_documents({"slug": slug}, limit=1) > 0

    def list_zones(
        self,
        *,
        country: str | None = None,
        zone_type: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[dict[str, Any]], int]:
        filters: dict[str, Any] = {}

        if country:
            filters["country"] = {
                "$regex": f"^{re.escape(country.strip())}$",
                "$options": "i",
            }
        if zone_type:
            filters["zone_type"] = {
                "$regex": f"^{re.escape(zone_type.strip())}$",
                "$options": "i",
            }
        if search:
            filters["name"] = {
                "$regex": re.escape(search.strip()),
                "$options": "i",
            }

        total = self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort([("name", 1), ("_id", 1)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        documents = [serialize_document(document) or {} for document in cursor]
        return documents, total
