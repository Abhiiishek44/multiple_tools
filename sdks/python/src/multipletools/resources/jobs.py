from __future__ import annotations

import asyncio
import json
import mimetypes
import os
import time
from collections.abc import Mapping
from pathlib import Path
from typing import BinaryIO
from urllib.parse import quote
from uuid import uuid4

from multipletools._internal.http import AsyncHttpClient, HttpClient
from multipletools.exceptions import ResponseValidationError, TimeoutError
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
        canonical_tool = _tool_name(tool)
        headers = {"Idempotency-Key": idempotency_key or uuid4().hex}
        data = _form_data(canonical_tool, options)
        if isinstance(file, (str, os.PathLike)):
            path = Path(file)
            with path.open("rb") as stream:
                payload = self._http.request_json(
                    "POST",
                    "/v1/jobs",
                    headers=headers,
                    data=data,
                    files={
                        "file": (
                            path.name,
                            stream,
                            media_type or _media_type(path.name),
                        )
                    },
                )
        else:
            filename = _stream_filename(file)
            payload = self._http.request_json(
                "POST",
                "/v1/jobs",
                headers=headers,
                data=data,
                files={"file": (filename, file, media_type or _media_type(filename))},
            )
        return Job.from_dict(_mapping(payload, "job"))

    def get(self, job_id: str) -> Job:
        payload = self._http.request_json("GET", f"/v1/jobs/{_job_id(job_id)}")
        return Job.from_dict(_mapping(payload, "job"))

    def wait(
        self,
        job_id: str,
        *,
        timeout: float | None = 300.0,
        poll_interval: float = 1.0,
    ) -> Job:
        _validate_wait(timeout, poll_interval)
        deadline = None if timeout is None else time.monotonic() + timeout
        while True:
            job = self.get(job_id)
            if job.is_terminal:
                return job
            if deadline is not None and time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for job {job_id}")
            delay = poll_interval
            if deadline is not None:
                delay = min(delay, max(0.0, deadline - time.monotonic()))
            time.sleep(delay)

    def create_and_wait(
        self,
        *,
        tool: str,
        file: FileInput,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
        timeout: float | None = 300.0,
        poll_interval: float = 1.0,
    ) -> Job:
        job = self.create(
            tool=tool,
            file=file,
            options=options,
            idempotency_key=idempotency_key,
            media_type=media_type,
        )
        return self.wait(job.id, timeout=timeout, poll_interval=poll_interval)

    def download(self, job_id: str, destination: str | os.PathLike[str]) -> Path:
        target = Path(destination)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_name(f".{target.name}.{uuid4().hex}.part")
        try:
            with (
                self._http.stream(
                    "GET", f"/v1/jobs/{_job_id(job_id)}/output"
                ) as response,
                temporary.open("wb") as output,
            ):
                for chunk in response.iter_bytes():
                    output.write(chunk)
            temporary.replace(target)
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
        return target


class AsyncJobs:
    def __init__(self, http: AsyncHttpClient) -> None:
        self._http = http

    async def create(
        self,
        *,
        tool: str,
        file: FileInput,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
    ) -> Job:
        canonical_tool = _tool_name(tool)
        headers = {"Idempotency-Key": idempotency_key or uuid4().hex}
        data = _form_data(canonical_tool, options)
        if isinstance(file, (str, os.PathLike)):
            path = Path(file)
            with path.open("rb") as stream:
                payload = await self._http.request_json(
                    "POST",
                    "/v1/jobs",
                    headers=headers,
                    data=data,
                    files={
                        "file": (
                            path.name,
                            stream,
                            media_type or _media_type(path.name),
                        )
                    },
                )
        else:
            filename = _stream_filename(file)
            payload = await self._http.request_json(
                "POST",
                "/v1/jobs",
                headers=headers,
                data=data,
                files={"file": (filename, file, media_type or _media_type(filename))},
            )
        return Job.from_dict(_mapping(payload, "job"))

    async def get(self, job_id: str) -> Job:
        payload = await self._http.request_json("GET", f"/v1/jobs/{_job_id(job_id)}")
        return Job.from_dict(_mapping(payload, "job"))

    async def wait(
        self,
        job_id: str,
        *,
        timeout: float | None = 300.0,
        poll_interval: float = 1.0,
    ) -> Job:
        _validate_wait(timeout, poll_interval)
        deadline = None if timeout is None else time.monotonic() + timeout
        while True:
            job = await self.get(job_id)
            if job.is_terminal:
                return job
            if deadline is not None and time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for job {job_id}")
            delay = poll_interval
            if deadline is not None:
                delay = min(delay, max(0.0, deadline - time.monotonic()))
            await asyncio.sleep(delay)

    async def create_and_wait(
        self,
        *,
        tool: str,
        file: FileInput,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
        timeout: float | None = 300.0,
        poll_interval: float = 1.0,
    ) -> Job:
        job = await self.create(
            tool=tool,
            file=file,
            options=options,
            idempotency_key=idempotency_key,
            media_type=media_type,
        )
        return await self.wait(job.id, timeout=timeout, poll_interval=poll_interval)

    async def download(self, job_id: str, destination: str | os.PathLike[str]) -> Path:
        target = Path(destination)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_name(f".{target.name}.{uuid4().hex}.part")
        try:
            async with self._http.stream(
                "GET", f"/v1/jobs/{_job_id(job_id)}/output"
            ) as response:
                with temporary.open("wb") as output:
                    async for chunk in response.aiter_bytes():
                        output.write(chunk)
            temporary.replace(target)
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
        return target


def _mapping(payload: object, kind: str) -> Mapping[str, object]:
    if not isinstance(payload, Mapping):
        raise ResponseValidationError(f"Expected the {kind} API to return an object")
    return payload


def _tool_name(tool: str) -> str:
    value = tool.strip().replace("_", "-")
    if not value:
        raise ValueError("tool must not be empty")
    return value


def _form_data(tool: str, options: Mapping[str, object] | None) -> dict[str, str]:
    data = {"tool": tool}
    if options is not None:
        data["options"] = json.dumps(options, separators=(",", ":"))
    return data


def _stream_filename(file: BinaryIO) -> str:
    return Path(str(getattr(file, "name", "upload.bin"))).name


def _job_id(job_id: str) -> str:
    if not job_id.strip():
        raise ValueError("job_id must not be empty")
    return quote(job_id, safe="")


def _media_type(filename: str) -> str:
    return mimetypes.guess_type(filename)[0] or "application/octet-stream"


def _validate_wait(timeout: float | None, poll_interval: float) -> None:
    if timeout is not None and timeout < 0:
        raise ValueError("timeout must not be negative")
    if poll_interval <= 0:
        raise ValueError("poll_interval must be greater than zero")
