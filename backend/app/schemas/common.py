"""Shared API response primitives."""

from __future__ import annotations

import math

from pydantic import BaseModel, Field


class PaginationMeta(BaseModel):
    page: int = Field(ge=1, description="Current page number (1-based).")
    page_size: int = Field(ge=1, description="Number of records per page.")
    total: int = Field(ge=0, description="Total matching records.")
    pages: int = Field(ge=0, description="Total number of pages.")
    has_next: bool = Field(description="Whether another page is available.")
    has_previous: bool = Field(description="Whether a previous page is available.")


def build_pagination(page: int, page_size: int, total: int) -> PaginationMeta:
    pages = math.ceil(total / page_size) if total else 0
    return PaginationMeta(
        page=page,
        page_size=page_size,
        total=total,
        pages=pages,
        has_next=page < pages,
        has_previous=page > 1,
    )


class ErrorResponse(BaseModel):
    detail: str = Field(description="Human-readable error message.")
    code: str = Field(description="Stable machine-readable error code.")
