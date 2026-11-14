"""Base MongoDB document model."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class MongoDocument(BaseModel):
    """Document model with a stringified BSON ObjectId for API use."""

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
        use_enum_values=True,
    )

    id: str | None = Field(default=None, alias="_id")
