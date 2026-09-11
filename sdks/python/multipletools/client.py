import re
from types import TracebackType

import httpx

from multipletools._http import HttpClient
from multipletools.jobs import Jobs
from multipletools.tools import Tools


_API_KEY_PATTERN = re.compile(r"^mt_live_[a-f0-9]{24}_[A-Za-z0-9_-]{32,128}$")


class Client:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = "http://localhost:8000",
        timeout: float | httpx.Timeout = 30.0,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        if not _API_KEY_PATTERN.fullmatch(api_key):
            raise ValueError("api_key must use the mt_live_<key_id>_<secret> format")
        if not base_url.startswith(("http://", "https://")):
            raise ValueError("base_url must be an absolute HTTP or HTTPS URL")
        self._http = HttpClient(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout,
            transport=transport,
        )
        self.jobs = Jobs(self._http)
        self.tools = Tools(self._http)

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "Client":
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()
