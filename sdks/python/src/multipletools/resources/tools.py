from collections.abc import Mapping

from multipletools._internal.http import AsyncHttpClient, HttpClient
from multipletools.exceptions import ResponseValidationError
from multipletools.models import Tool


class Tools:
    def __init__(self, http: HttpClient) -> None:
        self._http = http

    def list(self) -> list[Tool]:
        return _parse_tools(self._http.request_json("GET", "/v1/tools"))

    def get(self, name: str) -> Tool:
        canonical_name = name.strip().replace("_", "-")
        if not canonical_name:
            raise ValueError("name must not be empty")
        for tool in self.list():
            if tool.name == canonical_name:
                return tool
        raise LookupError(f"Unknown tool: {name}")


class AsyncTools:
    def __init__(self, http: AsyncHttpClient) -> None:
        self._http = http

    async def list(self) -> list[Tool]:
        return _parse_tools(await self._http.request_json("GET", "/v1/tools"))

    async def get(self, name: str) -> Tool:
        canonical_name = name.strip().replace("_", "-")
        if not canonical_name:
            raise ValueError("name must not be empty")
        for tool in await self.list():
            if tool.name == canonical_name:
                return tool
        raise LookupError(f"Unknown tool: {name}")


def _parse_tools(payload: object) -> list[Tool]:
    if not isinstance(payload, list):
        raise ResponseValidationError("Expected the tools API to return a list")
    if not all(isinstance(item, Mapping) for item in payload):
        raise ResponseValidationError("Expected every tool to be an object")
    return [Tool.from_dict(item) for item in payload]
