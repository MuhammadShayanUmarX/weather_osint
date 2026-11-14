"""Data source persistence and query operations."""

from __future__ import annotations

from typing import Any

from bson import ObjectId
from pymongo import ASCENDING
from pymongo.database import Database

from app.core.database import get_database
from app.utils.identifiers import serialize_document, to_object_id


class DataSourceRepository:
    def __init__(self, database: Database | None = None) -> None:
        self._database = database

    @property
    def collection(self):
        return (self._database or get_database())["data_sources"]

    def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        result = self.collection.insert_one(document)
        stored = dict(document)
        stored["_id"] = result.inserted_id
        return serialize_document(stored) or {}

    def get_by_id(self, source_id: str | ObjectId) -> dict[str, Any] | None:
        document = self.collection.find_one(
            {"_id": to_object_id(source_id, "source_id")}
        )
        return serialize_document(document)

    def list_sources(
        self,
        *,
        enabled: bool | None = None,
        source_type: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[dict[str, Any]], int]:
        filters: dict[str, Any] = {}
        if enabled is not None:
            filters["enabled"] = enabled
        if source_type:
            filters["source_type"] = source_type

        total = self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort([("name", ASCENDING), ("_id", ASCENDING)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        documents = [serialize_document(document) or {} for document in cursor]
        return documents, total
