"""MongoDB client lifecycle, collection creation, and index initialization."""

from __future__ import annotations

import logging
from typing import Any

from pymongo import ASCENDING, DESCENDING, IndexModel, MongoClient
from pymongo.database import Database
from pymongo.errors import CollectionInvalid, PyMongoError

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

COLLECTION_NAMES = ("zones", "observations", "alerts", "data_sources")

_client: MongoClient | None = None
_database: Database | None = None


def connect_to_mongo(settings: Settings | None = None) -> Database:
    """Create the shared MongoClient and verify connectivity."""

    global _client, _database

    if _client is not None and _database is not None:
        return _database

    settings = settings or get_settings()
    _client = MongoClient(
        settings.mongodb_uri,
        appname="environmental-intelligence-osint",
        tz_aware=True,
        serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
        connectTimeoutMS=settings.mongodb_connect_timeout_ms,
        maxPoolSize=settings.mongodb_max_pool_size,
    )
    _client.admin.command("ping")
    _database = _client[settings.mongodb_database]
    logger.info(
        "Connected to MongoDB database '%s' at '%s'",
        settings.mongodb_database,
        _client.address,
    )
    return _database


def get_client() -> MongoClient:
    if _client is None:
        raise RuntimeError("MongoDB client is not initialized")
    return _client


def get_database() -> Database:
    if _database is None:
        raise RuntimeError("MongoDB database is not initialized")
    return _database


def check_mongodb_connection() -> tuple[bool, str | None]:
    """Return connectivity state and a safe error message."""

    try:
        get_database().command("ping")
        return True, None
    except (RuntimeError, PyMongoError) as exc:
        return False, str(exc)


def close_mongo() -> None:
    global _client, _database

    if _client is not None:
        _client.close()
        logger.info("MongoDB connection closed")
    _client = None
    _database = None


def create_collections(database: Database) -> list[str]:
    """Create required collections, safely ignoring existing ones."""

    created: list[str] = []
    existing = set(database.list_collection_names())

    for name in COLLECTION_NAMES:
        if name in existing:
            continue
        try:
            database.create_collection(name)
            created.append(name)
            logger.info("Created MongoDB collection '%s'", name)
        except CollectionInvalid:
            # A concurrent process created the collection first.
            logger.debug("Collection '%s' already exists", name)

    return created


def _index_definitions() -> dict[str, list[IndexModel]]:
    return {
        "zones": [
            IndexModel(
                [("geometry", "2dsphere")],
                name="zones_geometry_2dsphere",
            ),
            IndexModel(
                [("slug", ASCENDING)],
                name="zones_slug_unique",
                unique=True,
            ),
            IndexModel([("name", ASCENDING)], name="zones_name"),
            IndexModel([("country", ASCENDING)], name="zones_country"),
            IndexModel([("zone_type", ASCENDING)], name="zones_zone_type"),
            IndexModel([("created_at", DESCENDING)], name="zones_created_at"),
        ],
        "observations": [
            IndexModel(
                [("location", "2dsphere")],
                name="observations_location_2dsphere",
            ),
            IndexModel(
                [("observation_type", ASCENDING)],
                name="observations_observation_type",
            ),
            IndexModel([("variable", ASCENDING)], name="observations_variable"),
            IndexModel([("source_id", ASCENDING)], name="observations_source_id"),
            IndexModel(
                [("observed_at", DESCENDING)],
                name="observations_observed_at",
            ),
            IndexModel(
                [("variable", ASCENDING), ("observed_at", DESCENDING)],
                name="observations_variable_observed_at",
            ),
            IndexModel(
                [("source_id", ASCENDING), ("observed_at", DESCENDING)],
                name="observations_source_observed_at",
            ),
            IndexModel(
                [("observation_type", ASCENDING), ("observed_at", DESCENDING)],
                name="observations_type_observed_at",
            ),
        ],
        "alerts": [
            IndexModel(
                [("geometry", "2dsphere")],
                name="alerts_geometry_2dsphere",
            ),
            IndexModel([("severity", ASCENDING)], name="alerts_severity"),
            IndexModel([("status", ASCENDING)], name="alerts_status"),
            IndexModel([("alert_type", ASCENDING)], name="alerts_alert_type"),
            IndexModel([("source_id", ASCENDING)], name="alerts_source_id"),
            IndexModel([("start_time", DESCENDING)], name="alerts_start_time"),
            IndexModel(
                [("status", ASCENDING), ("severity", ASCENDING), ("start_time", DESCENDING)],
                name="alerts_status_severity_start",
            ),
        ],
        "data_sources": [
            IndexModel(
                [("name", ASCENDING)],
                name="data_sources_name_unique",
                unique=True,
            ),
            IndexModel([("provider", ASCENDING)], name="data_sources_provider"),
            IndexModel([("source_type", ASCENDING)], name="data_sources_source_type"),
            IndexModel([("enabled", ASCENDING)], name="data_sources_enabled"),
        ],
    }


def create_indexes(database: Database) -> dict[str, list[str]]:
    """Create all required indexes. MongoDB makes this operation idempotent."""

    created_or_existing: dict[str, list[str]] = {}

    for collection_name, indexes in _index_definitions().items():
        collection = database[collection_name]
        collection.create_indexes(indexes)
        created_or_existing[collection_name] = sorted(
            collection.index_information().keys()
        )
        logger.info(
            "Ensured %d indexes on '%s'",
            len(indexes),
            collection_name,
        )

    return created_or_existing


def initialize_database(settings: Settings | None = None) -> dict[str, Any]:
    """Connect, verify, create collections, and create indexes."""

    settings = settings or get_settings()
    database = connect_to_mongo(settings)

    # Verify connectivity before making any schema changes.
    database.command("ping")

    created_collections = create_collections(database)
    indexes = create_indexes(database)

    summary = {
        "database": settings.mongodb_database,
        "collections": sorted(database.list_collection_names()),
        "created_collections": created_collections,
        "indexes": indexes,
    }
    logger.info(
        "Database initialization complete for '%s' (%d collections)",
        settings.mongodb_database,
        len(summary["collections"]),
    )
    return summary
