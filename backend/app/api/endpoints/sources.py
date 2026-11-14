"""Data source endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.api.dependencies import Pagination, enum_value, get_pagination
from app.models.data_source import DataSource
from app.models.enums import SourceType
from app.repositories.data_source_repository import DataSourceRepository
from app.schemas.common import ErrorResponse, build_pagination
from app.schemas.data_source import DataSourceListResponse, DataSourceRead
from app.utils.identifiers import OBJECT_ID_PATTERN

router = APIRouter()

SOURCE_ID_DESCRIPTION = "Data source MongoDB ObjectId (24 hexadecimal characters)."


def _to_read(document: dict) -> DataSourceRead:
    model = DataSource.model_validate(document)
    return DataSourceRead.model_validate(model.model_dump())


@router.get(
    "",
    response_model=DataSourceListResponse,
    summary="List data sources",
    description=(
        "Return source metadata and synchronization status. Credentials and "
        "secrets are never stored or returned."
    ),
)
def list_sources(
    enabled: Annotated[
        bool | None,
        Query(description="Filter by enabled state."),
    ] = None,
    source_type: Annotated[
        SourceType | None,
        Query(description="Filter by source category."),
    ] = None,
    pagination: Pagination = Depends(get_pagination),
) -> DataSourceListResponse:
    documents, total = DataSourceRepository().list_sources(
        enabled=enabled,
        source_type=enum_value(source_type),
        page=pagination.page,
        page_size=pagination.page_size,
    )

    return DataSourceListResponse(
        items=[_to_read(document) for document in documents],
        pagination=build_pagination(
            pagination.page,
            pagination.page_size,
            total,
        ),
    )


@router.get(
    "/{source_id}",
    response_model=DataSourceRead,
    summary="Get a data source",
    description=(
        "Retrieve one source with synchronization status. No credential fields "
        "exist in the response contract."
    ),
    responses={404: {"model": ErrorResponse, "description": "Source not found."}},
)
def get_source(
    source_id: Annotated[
        str,
        Path(pattern=OBJECT_ID_PATTERN, description=SOURCE_ID_DESCRIPTION),
    ],
) -> DataSourceRead:
    document = DataSourceRepository().get_by_id(source_id)
    if document is None:
        raise HTTPException(
            status_code=404,
            detail=f"Data source '{source_id}' was not found",
        )
    return _to_read(document)
