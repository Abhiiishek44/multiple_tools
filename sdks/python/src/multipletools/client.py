from __future__ import annotations

import os
from types import TracebackType
from urllib.parse import urlparse

import httpx

from multipletools._internal.http import AsyncHttpClient, HttpClient, RetryConfig
from multipletools.resources import AsyncJobs, AsyncTools, Jobs, Tools


class Client:
    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float | httpx.Timeout = 30.0,
        max_retries: int = 2,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        key, url = _configuration(api_key, base_url)
        self._http = HttpClient(
            api_key=key,
            base_url=url,
            timeout=timeout,
            retry=RetryConfig(max_attempts=max_retries + 1),
            transport=transport,
        )
        self.jobs = Jobs(self._http)
        self.tools = Tools(self._http)

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> Client:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()


class AsyncClient:
    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float | httpx.Timeout = 30.0,
        max_retries: int = 2,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        key, url = _configuration(api_key, base_url)
        self._http = AsyncHttpClient(
            api_key=key,
            base_url=url,
            timeout=timeout,
            retry=RetryConfig(max_attempts=max_retries + 1),
            transport=transport,
        )
        self.jobs = AsyncJobs(self._http)
        self.tools = AsyncTools(self._http)

    async def close(self) -> None:
        await self._http.close()

    async def __aenter__(self) -> AsyncClient:
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        await self.close()


def _configuration(api_key: str | None, base_url: str | None) -> tuple[str, str]:
    key = api_key or os.getenv("MULTIPLETOOLS_API_KEY")
    if not key or not key.strip():
        raise ValueError("api_key is required (or set MULTIPLETOOLS_API_KEY)")
    url = base_url or os.getenv("MULTIPLETOOLS_BASE_URL") or "http://localhost:8000"
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("base_url must be an absolute HTTP or HTTPS URL")
    return key, url
