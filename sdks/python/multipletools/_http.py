from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from typing import Any

import httpx

from multipletools.exceptions import (
    APIError,
    AuthenticationError,
    ConflictError,
    ConnectionError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    TimeoutError,
    ValidationError,
)


_ERROR_TYPES: dict[int, type[APIError]] = {
    400: ValidationError,
    401: AuthenticationError,
    403: PermissionDeniedError,
    404: NotFoundError,
    409: ConflictError,
    422: ValidationError,
    429: RateLimitError,
}


class HttpClient:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        timeout: float | httpx.Timeout,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._client = httpx.Client(
            base_url=base_url.rstrip("/") + "/",
            timeout=timeout,
            transport=transport,
            follow_redirects=False,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
                "User-Agent": "multipletools-python/0.1.0",
            },
        )

    def request_json(
        self,
        method: str,
        path: str,
        *,
        headers: Mapping[str, str] | None = None,
        data: Mapping[str, str] | None = None,
        files: Mapping[str, Any] | None = None,
    ) -> Any:
        try:
            response = self._client.request(
                method, path.lstrip("/"), headers=headers, data=data, files=files
            )
        except httpx.TimeoutException as error:
            raise TimeoutError("The Multiple Tools API request timed out") from error
        except httpx.RequestError as error:
            raise ConnectionError(
                f"Could not reach the Multiple Tools API: {error}"
            ) from error
        raise_for_status(response)
        try:
            return response.json()
        except ValueError as error:
            raise APIError(
                "The Multiple Tools API returned invalid JSON",
                status_code=response.status_code,
                request_id=response.headers.get("x-request-id"),
            ) from error

    @contextmanager
    def stream(self, method: str, path: str) -> Iterator[httpx.Response]:
        try:
            with self._client.stream(method, path.lstrip("/")) as response:
                if not 200 <= response.status_code < 300:
                    response.read()
                raise_for_status(response)
                yield response
        except httpx.TimeoutException as error:
            raise TimeoutError("The Multiple Tools API request timed out") from error
        except httpx.RequestError as error:
            raise ConnectionError(
                f"Could not reach the Multiple Tools API: {error}"
            ) from error

    def close(self) -> None:
        self._client.close()


def raise_for_status(response: httpx.Response) -> None:
    if 200 <= response.status_code < 300:
        return
    details: Any = None
    message = f"Multiple Tools API returned HTTP {response.status_code}"
    try:
        details = response.json()
        if isinstance(details, dict):
            detail = details.get("detail")
            if isinstance(detail, str) and detail:
                message = detail
            elif detail is not None:
                message = str(detail)
    except ValueError:
        pass
    error_type = _ERROR_TYPES.get(response.status_code, APIError)
    raise error_type(
        message,
        status_code=response.status_code,
        request_id=response.headers.get("x-request-id"),
        details=details,
    )
