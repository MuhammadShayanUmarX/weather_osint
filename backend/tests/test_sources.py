from __future__ import annotations


def test_list_and_get_sources(client, source_factory):
    source_id = source_factory(name="Open Weather Source")

    listing = client.get("/api/v1/sources")
    assert listing.status_code == 200
    body = listing.json()
    assert body["pagination"]["total"] == 1
    assert body["items"][0]["id"] == source_id
    assert body["items"][0]["sync_status"] == "healthy"

    detail = client.get(f"/api/v1/sources/{source_id}")
    assert detail.status_code == 200
    assert detail.json()["name"] == "Open Weather Source"


def test_source_response_never_exposes_credentials(client, source_factory):
    source_id = source_factory(name="Credential Safe Source")

    body = client.get(f"/api/v1/sources/{source_id}").json()

    serialized = str(body).lower()
    assert "api_key" not in serialized
    assert "password" not in serialized
    assert "secret" not in serialized
    assert "token" not in serialized


def test_source_sync_status_variants(client, source_factory):
    error_id = source_factory(
        name="Error Source",
        last_error="Upstream timeout",
    )
    disabled_id = source_factory(
        name="Disabled Source",
        enabled=False,
    )
    never_id = source_factory(
        name="Never Synced Source",
        last_successful_sync=None,
    )

    assert client.get(f"/api/v1/sources/{error_id}").json()["sync_status"] == "error"
    assert (
        client.get(f"/api/v1/sources/{disabled_id}").json()["sync_status"]
        == "disabled"
    )
    assert (
        client.get(f"/api/v1/sources/{never_id}").json()["sync_status"]
        == "never_synced"
    )


def test_source_filters_and_not_found(client, source_factory):
    source_factory(name="Enabled Weather", enabled=True, source_type="weather")
    source_factory(name="Disabled Fire", enabled=False, source_type="fire")

    disabled = client.get("/api/v1/sources", params={"enabled": "false"})
    assert disabled.json()["pagination"]["total"] == 1
    assert disabled.json()["items"][0]["name"] == "Disabled Fire"

    fire = client.get("/api/v1/sources", params={"source_type": "fire"})
    assert fire.json()["pagination"]["total"] == 1

    missing = client.get("/api/v1/sources/0123456789abcdef01234567")
    assert missing.status_code == 404
