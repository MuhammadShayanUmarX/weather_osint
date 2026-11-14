from __future__ import annotations

from tests.conftest import ZONE_GEOMETRY


def _zone_payload(**overrides):
    payload = {
        "name": "Coastal Zone",
        "zone_type": "region",
        "country": "IN",
        "administrative_level": "regional",
        "geometry": ZONE_GEOMETRY,
        "metadata": {"classification": "test"},
    }
    payload.update(overrides)
    return payload


def test_create_zone_computes_slug_and_area(client):
    response = client.post("/api/v1/zones", json=_zone_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["slug"] == "coastal-zone"
    assert body["area_km2"] > 0
    assert body["geometry"]["type"] == "Polygon"
    assert body["created_at"].endswith("Z")


def test_create_zone_with_multipolygon(client):
    geometry = {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [
                    [70.0, 20.0],
                    [72.0, 20.0],
                    [72.0, 22.0],
                    [70.0, 22.0],
                    [70.0, 20.0],
                ]
            ],
            [
                [
                    [75.0, 25.0],
                    [77.0, 25.0],
                    [77.0, 27.0],
                    [75.0, 27.0],
                    [75.0, 25.0],
                ]
            ],
        ],
    }
    response = client.post(
        "/api/v1/zones",
        json=_zone_payload(name="Island Group", geometry=geometry),
    )

    assert response.status_code == 201
    assert response.json()["geometry"]["type"] == "MultiPolygon"


def test_get_zone_and_list_filters(client, zone_factory):
    first_id = zone_factory(name="Alpha Region", country="IN", zone_type="region")
    zone_factory(name="Beta Basin", country="KE", zone_type="watershed")

    detail = client.get(f"/api/v1/zones/{first_id}")
    assert detail.status_code == 200
    assert detail.json()["name"] == "Alpha Region"

    by_country = client.get("/api/v1/zones", params={"country": "in"})
    assert by_country.status_code == 200
    assert by_country.json()["pagination"]["total"] == 1
    assert by_country.json()["items"][0]["name"] == "Alpha Region"

    by_type = client.get("/api/v1/zones", params={"zone_type": "watershed"})
    assert by_type.json()["pagination"]["total"] == 1
    assert by_type.json()["items"][0]["name"] == "Beta Basin"

    by_search = client.get("/api/v1/zones", params={"search": "alp"})
    assert by_search.json()["pagination"]["total"] == 1


def test_zone_pagination(client, zone_factory):
    for index in range(3):
        zone_factory(name=f"Paged Zone {index}")

    response = client.get("/api/v1/zones", params={"page": 1, "page_size": 2})

    body = response.json()
    assert len(body["items"]) == 2
    assert body["pagination"] == {
        "page": 1,
        "page_size": 2,
        "total": 3,
        "pages": 2,
        "has_next": True,
        "has_previous": False,
    }


def test_duplicate_slug_returns_conflict(client):
    first = client.post("/api/v1/zones", json=_zone_payload())
    second = client.post("/api/v1/zones", json=_zone_payload())

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["code"] == "conflict"


def test_invalid_geometry_is_rejected(client):
    unclosed = {
        "type": "Polygon",
        "coordinates": [
            [
                [70.0, 20.0],
                [80.0, 20.0],
                [80.0, 30.0],
                [70.0, 30.0],
            ]
        ],
    }
    response = client.post(
        "/api/v1/zones",
        json=_zone_payload(name="Unclosed", geometry=unclosed),
    )
    assert response.status_code == 422
    assert "closed" in str(response.json()["detail"])


def test_invalid_coordinate_order_is_rejected(client):
    latitude_out_of_range = {
        "type": "Polygon",
        "coordinates": [
            [
                [70.0, 20.0],
                [80.0, 20.0],
                [80.0, 95.0],
                [70.0, 95.0],
                [70.0, 20.0],
            ]
        ],
    }
    response = client.post(
        "/api/v1/zones",
        json=_zone_payload(name="Bad Latitude", geometry=latitude_out_of_range),
    )

    assert response.status_code == 422
    assert "latitude" in str(response.json()["detail"]).lower()


def test_point_geometry_is_invalid_for_zones(client):
    response = client.post(
        "/api/v1/zones",
        json=_zone_payload(
            name="Point Zone",
            geometry={"type": "Point", "coordinates": [75.0, 25.0]},
        ),
    )

    assert response.status_code == 422
    assert "Polygon" in str(response.json()["detail"])


def test_zone_observations_uses_point_in_polygon(
    client,
    zone_factory,
    source_factory,
    observation_factory,
):
    zone_id = zone_factory()
    source_id = source_factory()
    inside_id = observation_factory(source_id=source_id, longitude=75.0, latitude=25.0)
    observation_factory(source_id=source_id, longitude=90.0, latitude=40.0)

    response = client.get(f"/api/v1/zones/{zone_id}/observations")

    assert response.status_code == 200
    body = response.json()
    assert body["zone_id"] == zone_id
    assert body["pagination"]["total"] == 1
    assert body["items"][0]["id"] == inside_id
    assert body["items"][0]["location"]["coordinates"] == [75.0, 25.0]


def test_zone_observations_filter_inside_polygon(
    client,
    zone_factory,
    source_factory,
    observation_factory,
):
    zone_id = zone_factory()
    source_id = source_factory()
    observation_factory(
        source_id=source_id,
        observation_type="air_quality",
        variable="pm25",
        longitude=75.0,
        latitude=25.0,
    )
    observation_factory(
        source_id=source_id,
        observation_type="weather",
        variable="temperature_2m",
        longitude=76.0,
        latitude=26.0,
    )

    response = client.get(
        f"/api/v1/zones/{zone_id}/observations",
        params={"observation_type": "air_quality"},
    )

    assert response.json()["pagination"]["total"] == 1
    assert response.json()["items"][0]["variable"] == "pm25"


def test_unknown_zone_returns_not_found(client):
    response = client.get("/api/v1/zones/0123456789abcdef01234567")
    assert response.status_code == 404


def test_invalid_object_id_returns_validation_error(client):
    response = client.get("/api/v1/zones/not-an-object-id")
    assert response.status_code == 422
