"""Shared FastAPI dependencies and query-parameter parsers."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Annotated

from fastapi import HTTPException, Query

from app.utils.geo import parse_bbox, parse_point


@dataclass(frozen=True)
class Pagination:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_pagination(
    page: Annotated[
        int,
        Query(
            ge=1,
            description="1-based page number.",
            examples=[1],
        ),
    ] = 1,
    page_size: Annotated[
        int,
        Query(
            ge=1,
            le=100,
            description="Records per page (maximum 100).",
            examples=[20],
        ),
    ] = 20,
) -> Pagination:
    return Pagination(page=page, page_size=page_size)


def enum_value(value: Enum | str | None) -> str | None:
    if isinstance(value, Enum):
        return str(value.value)
    return value


def parse_bbox_param(value: str | None) -> tuple[float, float, float, float] | None:
    if value is None:
        return None
    try:
        return parse_bbox(value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def parse_near_param(value: str | None) -> tuple[float, float] | None:
    if value is None:
        return None
    try:
        return parse_point(value, "near")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
