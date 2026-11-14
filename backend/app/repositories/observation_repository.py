"""Observation persistence and geospatial query operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database

from app.core.database import get_database
from app.utils.identifiers import serialize_document, to_object_id


class ObservationRepository:
    def __init__(self, database: Database | None = None) -> None:
        self._database = database

    @property
    def collection(self):
        return (self._database or get_database())["observations"]

    def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        result = self.collection.insert_one(document)
        stored = dict(document)
        stored["_id"] = result.inserted_id
        return serialize_document(stored) or {}

    def get_by_id(self, observation_id: str | ObjectId) -> dict[str, Any] | None:
        document = self.collection.find_one(
            {"_id": to_object_id(observation_id, "observation_id")}
        )
        return serialize_document(document)

    def _build_filters(
        self,
        *,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | ObjectId | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        zone_geometry: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        filters: dict[str, Any] = {}

        if observation_type:
            filters["observation_type"] = observation_type
        if variable:
            filters["variable"] = variable
        if source_id:
            filters["source_id"] = to_object_id(source_id, "source_id")

        if start_date or end_date:
            date_filter: dict[str, datetime] = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            filters["observed_at"] = date_filter

        if bbox:
            min_lon, min_lat, max_lon, max_lat = bbox
            filters["location"] = {
                "$geoWithin": {
                    "$box": [[min_lon, min_lat], [max_lon, max_lat]],
                }
            }
        elif zone_geometry:
            filters["location"] = {
                "$geoWithin": {
                    "$geometry": zone_geometry,
                }
            }

        return filters

    def list_observations(
        self,
        *,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | ObjectId | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        zone_geometry: dict[str, Any] | None = None,
        near: tuple[float, float] | None = None,
        radius_km: float = 50.0,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[dict[str, Any]], int]:
        filters = self._build_filters(
            observation_type=observation_type,
            variable=variable,
            source_id=source_id,
            start_date=start_date,
            end_date=end_date,
            bbox=bbox,
            zone_geometry=zone_geometry,
        )

        if near:
            longitude, latitude = near
            pipeline = [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude],
                        },
                        "distanceField": "distance_m",
                        "maxDistance": radius_km * 1000.0,
                        "spherical": True,
                        "key": "location",
                        "query": filters,
                    }
                },
                {"$sort": {"distance_m": ASCENDING, "_id": ASCENDING}},
                {
                    "$facet": {
                        "items": [
                            {"$skip": (page - 1) * page_size},
                            {"$limit": page_size},
                        ],
                        "total": [{"$count": "count"}],
                    }
                },
            ]
            result = list(self.collection.aggregate(pipeline, allowDiskUse=True))
            if not result:
                return [], 0
            items = [serialize_document(document) or {} for document in result[0]["items"]]
            total = result[0]["total"][0]["count"] if result[0]["total"] else 0
            return items, total

        total = self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort([("observed_at", DESCENDING), ("_id", DESCENDING)])
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        documents = [serialize_document(document) or {} for document in cursor]
        return documents, total

    def find_geojson_observations(
        self,
        *,
        observation_type: str | None = None,
        variable: str | None = None,
        source_id: str | ObjectId | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        bbox: tuple[float, float, float, float] | None = None,
        zone_geometry: dict[str, Any] | None = None,
        near: tuple[float, float] | None = None,
        radius_km: float = 50.0,
        limit: int = 1000,
    ) -> list[dict[str, Any]]:
        filters = self._build_filters(
            observation_type=observation_type,
            variable=variable,
            source_id=source_id,
            start_date=start_date,
            end_date=end_date,
            bbox=bbox,
            zone_geometry=zone_geometry,
        )

        if near:
            longitude, latitude = near
            # The dedicated GeoJSON path uses the $near operator. Paginated
            # list responses use $geoNear so they can return distance and totals.
            filters["location"] = {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude],
                    },
                    "$maxDistance": radius_km * 1000.0,
                }
            }
            cursor = self.collection.find(filters).limit(limit)
        else:
            cursor = (
                self.collection.find(filters)
                .sort([("observed_at", DESCENDING), ("_id", DESCENDING)])
                .limit(limit)
            )

        return [serialize_document(document) or {} for document in cursor]
