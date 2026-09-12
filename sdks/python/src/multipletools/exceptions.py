from collections.abc import Mapping
from typing import Any


class MultipleToolsError(Exception):
    """Base exception for all SDK failures."""


class ConnectionError(MultipleToolsError):
    """The API could not be reached."""


class TimeoutError(MultipleToolsError):
    """The API request exceeded its configured timeout."""


class ResponseValidationError(MultipleToolsError):
    """The API returned a response that violates its documented contract."""


class APIError(MultipleToolsError):
    """The API returned a non-success response."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        code: str | None = None,
        request_id: str | None = None,
        details: Any = None,
        retry_after: float | None = None,
        headers: Mapping[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.request_id = request_id
        self.details = details
        self.retry_after = retry_after
        self.headers = dict(headers or {})


class ValidationError(APIError):
    pass


class AuthenticationError(APIError):
    pass


class PermissionDeniedError(APIError):
    pass


class NotFoundError(APIError):
    pass


class ConflictError(APIError):
    pass


class RateLimitError(APIError):
    pass
