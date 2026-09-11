from typing import Any


class MultipleToolsError(Exception):
    """Base exception for all SDK failures."""


class ConnectionError(MultipleToolsError):
    """The API could not be reached."""


class TimeoutError(MultipleToolsError):
    """The API request exceeded its configured timeout."""


class APIError(MultipleToolsError):
    """The API returned a non-success response."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        request_id: str | None = None,
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.request_id = request_id
        self.details = details


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
