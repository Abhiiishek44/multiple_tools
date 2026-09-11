import json
import mimetypes
import os
from pathlib import Path
from typing import BinaryIO, Mapping
from urllib.parse import quote
from uuid import uuid4

from multipletools._http import HttpClient
from multipletools.models import Job


FileInput = str | os.PathLike[str] | BinaryIO


class Jobs:
    def __init__(self, http: HttpClient) -> None:
        self._http = http

    def create(
        self,
        *,
        tool: str,
        file: FileInput,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
    ) -> Job:
        canonical_tool = tool.strip().replace("_", "-")
        if not canonical_tool:
            raise ValueError("tool must not be empty")
        headers = {"Idempotency-Key": idempotency_key or uuid4().hex}
        data = {"tool": canonical_tool}
        if options:
            data["options"] = json.dumps(options, separators=(",", ":"))

        if isinstance(file, (str, os.PathLike)):
            path = Path(file)
            resolved_media_type = media_type or _media_type(path.name)
            with path.open("rb") as stream:
                payload = self._http.request_json(
                    "POST",
                    "/v1/jobs",
                    headers=headers,
                    data=data,
                    files={"file": (path.name, stream, resolved_media_type)},
                )
        else:
            filename = Path(str(getattr(file, "name", "upload.bin"))).name
            resolved_media_type = media_type or _media_type(filename)
            payload = self._http.request_json(
                "POST",
                "/v1/jobs",
                headers=headers,
                data=data,
                files={"file": (filename, file, resolved_media_type)},
            )
        return Job.from_dict(payload)

    def get(self, job_id: str) -> Job:
        payload = self._http.request_json("GET", f"/v1/jobs/{_job_id(job_id)}")
        return Job.from_dict(payload)

    def download(
        self,
        job_id: str,
        destination: str | os.PathLike[str],
    ) -> Path:
        target = Path(destination)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_name(f".{target.name}.{uuid4().hex}.part")
        try:
            with self._http.stream(
                "GET", f"/v1/jobs/{_job_id(job_id)}/output"
            ) as response:
                with temporary.open("wb") as output:
                    for chunk in response.iter_bytes():
                        output.write(chunk)
            temporary.replace(target)
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
        return target


def _job_id(job_id: str) -> str:
    if not job_id:
        raise ValueError("job_id must not be empty")
    return quote(job_id, safe="")


def _media_type(filename: str) -> str:
    return mimetypes.guess_type(filename)[0] or "application/octet-stream"
