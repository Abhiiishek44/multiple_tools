from __future__ import annotations

import asyncio
import random
import time
from collections.abc import AsyncIterator, Iterator
from contextlib import asynccontextmanager, contextmanager
from dataclasses import dataclass
from email.utils import parsedate_to_datetime
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
    ResponseValidationError,
    TimeoutError,
    ValidationError,
)
from multipletools.version import __version__

_ERROR_TYPES: dict[int, type[APIError]] = {
    400: ValidationError,
    401: AuthenticationError,
    403: PermissionDeniedError,
    404: NotFoundError,
    409: ConflictError,
    422: ValidationError,
    429: RateLimitError,
}
_RETRYABLE_STATUSES = frozenset({408, 429, 502, 503, 504})


@dataclass(frozen=True, slots=True)
class RetryConfig:
    max_attempts: int = 3
    initial_delay: float = 0.25
    max_delay: float = 2.0

    def __post_init__(self) -> None:
        if self.max_attempts < 1:
            raise ValueError("max_attempts must be at least 1")
        if self.initial_delay < 0 or self.max_delay < 0:
            raise ValueError("retry delays must not be negative")


def default_headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": f"multipletools-python/{__version__}",
    }


class HttpClient:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        timeout: float | httpx.Timeout,
        retry: RetryConfig,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.retry = retry
        self.client = httpx.Client(
            base_url=base_url.rstrip("/") + "/",
            timeout=timeout,
            transport=transport,
            follow_redirects=False,
            headers=default_headers(api_key),
        )

    def request_json(self, method: str, path: str, **kwargs: Any) -> Any:
        method = method.upper()
        attempts = self.retry.max_attempts if method in {"GET", "HEAD"} else 1
        for attempt in range(attempts):
            try:
                response = self.client.request(method, path.lstrip("/"), **kwargs)
            except httpx.TimeoutException as error:
                if attempt + 1 < attempts:
                    time.sleep(_delay(self.retry, attempt, None))
                    continue
                raise TimeoutError(
                    "The Multiple Tools API request timed out"
                ) from error
            except httpx.RequestError as error:
                if attempt + 1 < attempts:
                    time.sleep(_delay(self.retry, attempt, None))
                    continue
                raise ConnectionError(
                    f"Could not reach the Multiple Tools API: {error}"
                ) from error
            if response.status_code in _RETRYABLE_STATUSES and attempt + 1 < attempts:
                time.sleep(_delay(self.retry, attempt, _retry_after(response)))
                continue
            raise_for_status(response)
            return _json(response)
        raise AssertionError("unreachable")

    @contextmanager
    def stream(self, method: str, path: str) -> Iterator[httpx.Response]:
        try:
            with self.client.stream(method, path.lstrip("/")) as response:
                if not response.is_success:
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
        self.client.close()


class AsyncHttpClient:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        timeout: float | httpx.Timeout,
        retry: RetryConfig,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.retry = retry
        self.client = httpx.AsyncClient(
            base_url=base_url.rstrip("/") + "/",
            timeout=timeout,
            transport=transport,
            follow_redirects=False,
            headers=default_headers(api_key),
        )

    async def request_json(self, method: str, path: str, **kwargs: Any) -> Any:
        method = method.upper()
        attempts = self.retry.max_attempts if method in {"GET", "HEAD"} else 1
        for attempt in range(attempts):
            try:
                response = await self.client.request(method, path.lstrip("/"), **kwargs)
            except httpx.TimeoutException as error:
                if attempt + 1 < attempts:
                    await asyncio.sleep(_delay(self.retry, attempt, None))
                    continue
                raise TimeoutError(
                    "The Multiple Tools API request timed out"
                ) from error
            except httpx.RequestError as error:
                if attempt + 1 < attempts:
                    await asyncio.sleep(_delay(self.retry, attempt, None))
                    continue
                raise ConnectionError(
                    f"Could not reach the Multiple Tools API: {error}"
                ) from error
            if response.status_code in _RETRYABLE_STATUSES and attempt + 1 < attempts:
                await asyncio.sleep(_delay(self.retry, attempt, _retry_after(response)))
                continue
            raise_for_status(response)
            return _json(response)
        raise AssertionError("unreachable")

    @asynccontextmanager
    async def stream(self, method: str, path: str) -> AsyncIterator[httpx.Response]:
        try:
            async with self.client.stream(method, path.lstrip("/")) as response:
                if not response.is_success:
                    await response.aread()
                raise_for_status(response)
                yield response
        except httpx.TimeoutException as error:
            raise TimeoutError("The Multiple Tools API request timed out") from error
        except httpx.RequestError as error:
            raise ConnectionError(
                f"Could not reach the Multiple Tools API: {error}"
            ) from error

    async def close(self) -> None:
        await self.client.aclose()


def _json(response: httpx.Response) -> Any:
    try:
        return response.json()
    except ValueError as error:
        raise ResponseValidationError(
            "The Multiple Tools API returned invalid JSON"
        ) from error


def raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return
    details: Any = None
    code: str | None = None
    message = f"Multiple Tools API returned HTTP {response.status_code}"
    try:
        details = response.json()
        if isinstance(details, dict):
            body = details.get("error", details)
            if isinstance(body, dict):
                code_value = body.get("code")
                code = str(code_value) if code_value is not None else None
                detail = body.get("message", body.get("detail"))
            else:
                detail = details.get("detail")
            if detail is not None:
                message = str(detail)
    except ValueError:
        pass
    error_type = _ERROR_TYPES.get(response.status_code, APIError)
    raise error_type(
        message,
        status_code=response.status_code,
        code=code,
        request_id=response.headers.get("x-request-id"),
        details=details,
        retry_after=_retry_after(response),
        headers=response.headers,
    )


def _retry_after(response: httpx.Response) -> float | None:
    value = response.headers.get("retry-after")
    if value is None:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        try:
            date = parsedate_to_datetime(value)
            return max(0.0, date.timestamp() - time.time())
        except (TypeError, ValueError, OverflowError):
            return None


def _delay(config: RetryConfig, attempt: int, retry_after: float | None) -> float:
    if retry_after is not None:
        return min(retry_after, config.max_delay)
    ceiling = min(config.initial_delay * (2**attempt), config.max_delay)
    return random.uniform(0, ceiling)
