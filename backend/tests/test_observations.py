from __future__ import annotations

from datetime import datetime, timezone

from tests.conftest import BASE_TIME


def _seed_observations(source_id, observation_factory):
    observation_factory(
        source_id=source_id,
        observation_type="air_quality",
        variable="pm25",
        value=42.5,
        longitude=75.0,
        latitude=25.0,
        observed_at=BASE_TIME,
    )
    observation_factory(
        source_id=source_id,
        observation_type="weather",
        variable="temperature_2m",
        value=31.2,
        longitude=75.5,
        latitude=25.5,
        observed_at=datetime(2026, 1, 2, 12, 0, tzinfo=timezone.utc),
    )
    observation_factory(
        source_id=source_id,
        observation_type="weather",
        variable="temperature_2m",
        value=18.0,
        longitude=90.0,
        latitude=40.0,
        observed_at=datetime(2025, 12, 31, 12, 0, tzinfo=timezone.utc),
    )


def test_observation_filters(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    by_type = client.get(
        "/api/v1/observations",
        params={"observation_type": "air_quality"},
    )
    assert by_type.status_code == 200
    assert by_type.json()["pagination"]["total"] == 1
    assert by_type.json()["items"][0]["variable"] == "pm25"

    by_variable = client.get(
        "/api/v1/observations",
        params={"variable": "temperature_2m"},
    )
    assert by_variable.json()["pagination"]["total"] == 2

    by_source = client.get(
        "/api/v1/observations",
        params={"source_id": source_id},
    )
    assert by_source.json()["pagination"]["total"] == 3

    by_date = client.get(
        "/api/v1/observations",
        params={
            "start_date": "2026-01-01T00:00:00Z",
            "end_date": "2026-01-01T23:59:59Z",
        },
    )
    assert by_date.json()["pagination"]["total"] == 1
    assert by_date.json()["items"][0]["observed_at"].startswith("2026-01-01")


def test_bounding_box_query(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    response = client.get(
        "/api/v1/observations",
        params={"bbox": "72,22,78,28"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["pagination"]["total"] == 2
    coordinates = [item["location"]["coordinates"] for item in body["items"]]
    assert [75.0, 25.0] in coordinates
    assert [90.0, 40.0] not in coordinates


def test_nearby_search_orders_by_distance(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    response = client.get(
        "/api/v1/observations/nearby",
        params={"lon": 75.0, "lat": 25.0, "radius_km": 100},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["pagination"]["total"] == 2
    distances = [item["distance_m"] for item in body["items"]]
    assert distances[0] == 0.0
    assert distances[0] < distances[1]

    near_query = client.get(
        "/api/v1/observations",
        params={"near": "75,25", "radius_km": 100},
    )
    assert near_query.status_code == 200
    assert near_query.json()["pagination"]["total"] == 2


def test_geojson_feature_collection(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    response = client.get(
        "/api/v1/observations/geojson",
        params={"bbox": "72,22,78,28"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["type"] == "FeatureCollection"
    assert len(body["features"]) == 2
    feature = next(
        item
        for item in body["features"]
        if item["geometry"]["coordinates"] == [75.0, 25.0]
    )
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] == "Point"
    assert feature["properties"]["source_id"] == source_id


def test_geojson_near_uses_near_operator(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    response = client.get(
        "/api/v1/observations/geojson",
        params={"near": "75,25", "radius_km": 100, "limit": 10},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["features"]) == 2


def test_invalid_bbox_is_rejected(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    _seed_observations(source_id, observation_factory)

    response = client.get(
        "/api/v1/observations",
        params={"bbox": "80,30,70,20"},
    )

    assert response.status_code == 422
    assert "min_lon" in response.json()["detail"]


def test_spatial_filters_are_mutually_exclusive(client):
    response = client.get(
        "/api/v1/observations",
        params={
            "bbox": "72,22,78,28",
            "zone_id": "0123456789abcdef01234567",
        },
    )

    assert response.status_code == 400
    assert "only one spatial filter" in response.json()["detail"]


def test_invalid_date_range_is_rejected(client):
    response = client.get(
        "/api/v1/observations",
        params={
            "start_date": "2026-01-02T00:00:00Z",
            "end_date": "2026-01-01T00:00:00Z",
        },
    )

    assert response.status_code == 400
    assert "start_date" in response.json()["detail"]


def test_observation_detail_and_not_found(
    client,
    source_factory,
    observation_factory,
):
    source_id = source_factory()
    observation_id = observation_factory(source_id=source_id)

    detail = client.get(f"/api/v1/observations/{observation_id}")
    assert detail.status_code == 200
    assert detail.json()["id"] == observation_id

    missing = client.get("/api/v1/observations/0123456789abcdef01234567")
    assert missing.status_code == 404


def test_naive_timestamp_is_rejected(client):
    response = client.get(
        "/api/v1/observations",
        params={"start_date": "2026-01-01T00:00:00"},
    )

    assert response.status_code == 422
    assert "timezone" in str(response.json()["detail"]).lower()
