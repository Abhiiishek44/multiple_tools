from multipletools._http import HttpClient
from multipletools.models import Tool


class Tools:
    def __init__(self, http: HttpClient) -> None:
        self._http = http

    def list(self) -> list[Tool]:
        payload = self._http.request_json("GET", "/v1/tools")
        if not isinstance(payload, list):
            raise ValueError("Expected the tools API to return a list")
        return [Tool.from_dict(item) for item in payload]

    def get(self, name: str) -> Tool:
        canonical_name = name.replace("_", "-")
        for tool in self.list():
            if tool.name == canonical_name:
                return tool
        raise LookupError(f"Unknown tool: {name}")
