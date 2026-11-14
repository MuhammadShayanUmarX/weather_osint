"""Domain-level exceptions mapped to HTTP responses by the application."""

from __future__ import annotations


class ServiceError(Exception):
    """Base class for errors that are safe to expose to API clients."""

    status_code = 400
    code = "service_error"

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class BadRequestError(ServiceError):
    status_code = 400
    code = "bad_request"


class UnprocessableError(ServiceError):
    status_code = 422
    code = "unprocessable_entity"


class NotFoundError(ServiceError):
    status_code = 404
    code = "not_found"


class ConflictError(ServiceError):
    status_code = 409
    code = "conflict"
