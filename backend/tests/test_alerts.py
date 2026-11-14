from __future__ import annotations

from datetime import datetime, timezone

from tests.conftest import BASE_TIME, ZONE_GEOMETRY


def test_alert_filters(client, source_factory, alert_factory):
    source_id = source_factory()
    alert_factory(
        source_id=source_id,
        title="Flood Watch",
        alert_type="flood",
        severity="high",
        status="active",
    )
    alert_factory(
        source_id=source_id,
        title="Heat Advisory",
        alert_type="heat",
        severity="moderate",
        status="resolved",
        start_time=datetime(2026, 1, 2, 12, 0, tzinfo=timezone.utc),
    )

    by_severity = client.get("/api/v1/alerts", params={"severity": "high"})
    assert by_severity.status_code == 200
    assert by_severity.json()["pagination"]["total"] == 1
    assert by_severity.json()["items"][0]["title"] == "Flood Watch"

    by_status = client.get("/api/v1/alerts", params={"status": "resolved"})
    assert by_status.json()["pagination"]["total"] == 1

    by_type = client.get("/api/v1/alerts", params={"alert_type": "heat"})
    assert by_type.json()["pagination"]["total"] == 1

    by_source = client.get("/api/v1/alerts", params={"source_id": source_id})
    assert by_source.json()["pagination"]["total"] == 2

    by_date = client.get(
        "/api/v1/alerts",
        params={
            "start_date": "2026-01-02T00:00:00Z",
            "end_date": "2026-01-03T00:00:00Z",
        },
    )
    assert by_date.json()["pagination"]["total"] == 1
    assert by_date.json()["items"][0]["title"] == "Heat Advisory"


def test_alert_zone_intersection(
    client,
    source_factory,
    zone_factory,
    alert_factory,
):
    source_id = source_factory()
    zone_id = zone_factory(geometry=ZONE_GEOMETRY)
    alert_factory(source_id=source_id, title="Inside Alert")
    alert_factory(
        source_id=source_id,
        title="Outside Alert",
        geometry={
            "type": "Polygon",
            "coordinates": [
                [
                    [10.0, 10.0],
                    [12.0, 10.0],
                    [12.0, 12.0],
                    [10.0, 12.0],
                    [10.0, 10.0],
                ]
            ],
        },
    )

    response = client.get("/api/v1/alerts", params={"zone_id": zone_id})

    assert response.status_code == 200
    body = response.json()
    assert body["pagination"]["total"] == 1
    assert body["items"][0]["title"] == "Inside Alert"


def test_alert_detail_and_not_found(client, source_factory, alert_factory):
    source_id = source_factory()
    alert_id = alert_factory(source_id=source_id)

    detail = client.get(f"/api/v1/alerts/{alert_id}")
    assert detail.status_code == 200
    assert detail.json()["id"] == alert_id
    assert detail.json()["start_time"].endswith("Z")

    missing = client.get("/api/v1/alerts/0123456789abcdef01234567")
    assert missing.status_code == 404


def test_alert_invalid_date_range(client):
    response = client.get(
        "/api/v1/alerts",
        params={
            "start_date": "2026-01-02T00:00:00Z",
            "end_date": "2026-01-01T00:00:00Z",
        },
    )

    assert response.status_code == 400
