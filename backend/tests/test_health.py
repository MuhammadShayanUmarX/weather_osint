from __future__ import annotations

from app.core.database import COLLECTION_NAMES, initialize_database


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["application_version"] == "1.0.0"
    assert body["timestamp"].endswith("Z")


def test_system_status_reports_mongodb_connectivity(client):
    response = client.get("/api/v1/system/status")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["api_status"] == "ok"
    assert body["mongodb_status"] == "connected"
    assert body["database_name"].startswith("environmental_intelligence_test_")
    assert body["environment"] == "test"


def test_mongodb_connectivity_and_collections(db):
    assert db.command("ping")["ok"] == 1.0
    collections = set(db.list_collection_names())
    assert set(COLLECTION_NAMES).issubset(collections)


def test_required_2dsphere_indexes_exist(db):
    expected = {
        "zones": "geometry",
        "observations": "location",
        "alerts": "geometry",
    }

    for collection_name, field in expected.items():
        index_info = db[collection_name].index_information()
        assert any(
            spec.get("key") == [(field, "2dsphere")]
            for spec in index_info.values()
        ), f"missing 2dsphere index on {collection_name}.{field}"


def test_index_initialization_is_idempotent(db):
    first = initialize_database()
    second = initialize_database()

    assert first["database"] == second["database"]
    assert set(first["indexes"]) == set(second["indexes"])
    assert set(first["collections"]) == set(second["collections"])
