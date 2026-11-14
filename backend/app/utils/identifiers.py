"""BSON ObjectId and MongoDB document serialization helpers."""

from __future__ import annotations

import re
from typing import Any

from bson import ObjectId

OBJECT_ID_PATTERN = r"^[a-fA-F0-9]{24}$"


def to_object_id(value: str | ObjectId, field_name: str = "id") -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    if not isinstance(value, str) or not ObjectId.is_valid(value):
        raise ValueError(
            f"{field_name} must be a 24-character hexadecimal MongoDB ObjectId"
        )
    return ObjectId(value)


def serialize_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert BSON-only values to JSON-friendly values without mutating input."""

    if document is None:
        return None

    serialized = dict(document)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    if isinstance(serialized.get("source_id"), ObjectId):
        serialized["source_id"] = str(serialized["source_id"])
    return serialized


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "zone"
