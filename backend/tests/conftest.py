from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any, Callable

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo import MongoClient

os.environ["MONGODB_URI"] = os.environ.get(
    "TEST_MONGODB_URI", "mongodb://127.0.0.1:27017"
)
os.environ["MONGODB_DATABASE"] = os.environ.get(
    "TEST_MONGODB_DATABASE",
    f"environmental_intelligence_test_{uuid.uuid4().hex[:10]}",
)
os.environ["ENVIRONMENT"] = "test"
os.environ["LOG_LEVEL"] = "WARNING"

from app.core.config import get_settings  # noqa: E402
from app.core.database import COLLECTION_NAMES, get_database  # noqa: E402
from app.main import app  # noqa: E402

BASE_TIME = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
ZONE_GEOMETRY = {
    "type": "Polygon",
    "coordinates": [
        [
            [70.0, 20.0],
            [80.0, 20.0],
            [80.0, 30.0],
            [70.0, 30.0],
            [70.0, 20.0],
        ]
    ],
}


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client

    settings = get_settings()
    cleanup_client = MongoClient(settings.mongodb_uri)
    cleanup_client.drop_database(settings.mongodb_database)
    cleanup_client.close()


@pytest.fixture(autouse=True)
def clean_database(client: TestClient):
    database = get_database()
    for collection_name in COLLECTION_NAMES:
        database[collection_name].delete_many({})
    yield


@pytest.fixture
def db():
    return get_database()


@pytest.fixture
def source_factory(db) -> Callable[..., str]:
    def create_source(
        *,
        name: str = "Test Source",
        provider: str = "Test Provider",
        source_type: str = "weather",
        enabled: bool = True,
        last_error: str | None = None,
        last_successful_sync: datetime | None = BASE_TIME,
    ) -> str:
        document = {
            "name": name,
            "provider": provider,
            "source_type": source_type,
            "description": "Synthetic source used by automated tests.",
            "website_url": "https://example.org",
            "access_type": "open",
            "license": "CC-BY-4.0",
            "attribution": "Test Provider",
            "enabled": enabled,
            "last_successful_sync": last_successful_sync,
            "last_error": last_error,
            "created_at": BASE_TIME,
            "updated_at": BASE_TIME,
        }
        return str(db.data_sources.insert_one(document).inserted_id)

    return create_source


@pytest.fixture
def zone_factory(db) -> Callable[..., str]:
    def create_zone(
        *,
        name: str = "Test Zone",
        slug: str | None = None,
        geometry: dict[str, Any] | None = None,
        country: str = "IN",
        zone_type: str = "region",
    ) -> str:
        now = BASE_TIME
        document = {
            "name": name,
            "slug": slug or name.lower().replace(" ", "-"),
            "zone_type": zone_type,
            "country": country,
            "administrative_level": "regional",
            "geometry": geometry or ZONE_GEOMETRY,
            "area_km2": 1000.0,
            "metadata": {},
            "created_at": now,
            "updated_at": now,
        }
        return str(db.zones.insert_one(document).inserted_id)

    return create_zone


@pytest.fixture
def observation_factory(db) -> Callable[..., str]:
    def create_observation(
        *,
        source_id: str,
        observation_type: str = "weather",
        variable: str = "temperature_2m",
        value: float = 25.0,
        unit: str = "celsius",
        longitude: float = 75.0,
        latitude: float = 25.0,
        observed_at: datetime = BASE_TIME,
        quality_status: str = "verified",
        location_name: str = "Test Station",
    ) -> str:
        document = {
            "source_id": ObjectId(source_id),
            "observation_type": observation_type,
            "variable": variable,
            "value": value,
            "unit": unit,
            "observed_at": observed_at,
            "received_at": observed_at,
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude],
            },
            "location_name": location_name,
            "metadata": {"station": "TEST-001"},
            "quality_status": quality_status,
        }
        return str(db.observations.insert_one(document).inserted_id)

    return create_observation


@pytest.fixture
def alert_factory(db) -> Callable[..., str]:
    def create_alert(
        *,
        source_id: str,
        title: str = "Test Alert",
        alert_type: str = "flood",
        severity: str = "high",
        status: str = "active",
        geometry: dict[str, Any] | None = None,
        start_time: datetime = BASE_TIME,
        end_time: datetime | None = None,
    ) -> str:
        document = {
            "title": title,
            "description": "Synthetic alert used by automated tests.",
            "alert_type": alert_type,
            "severity": severity,
            "status": status,
            "source_id": ObjectId(source_id),
            "geometry": geometry
            or {
                "type": "Polygon",
                "coordinates": [
                    [
                        [74.0, 24.0],
                        [76.0, 24.0],
                        [76.0, 26.0],
                        [74.0, 26.0],
                        [74.0, 24.0],
                    ]
                ],
            },
            "start_time": start_time,
            "end_time": end_time,
            "created_at": BASE_TIME,
            "updated_at": BASE_TIME,
        }
        return str(db.alerts.insert_one(document).inserted_id)

    return create_alert
