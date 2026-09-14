from __future__ import annotations

from collections.abc import Callable, Mapping
from types import MappingProxyType
from typing import Generic, TypeVar

from multipletools._generated_tools import TOOL_METHODS, ToolMethods
from multipletools.models import Job
from multipletools.resources.jobs import AsyncJobs, FileInput, Jobs

CONVERSION_TOOLS: Mapping[str, str] = MappingProxyType(
    {method: method.replace("_", "-") for method in TOOL_METHODS}
)


class Conversion:
    def __init__(self, jobs: Jobs, tool: str) -> None:
        self._jobs = jobs
        self._tool = tool

    def __call__(
        self,
        file: FileInput,
        *,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
    ) -> Job:
        return self._jobs.create(
            tool=self._tool,
            file=file,
            options=options,
            idempotency_key=idempotency_key,
            media_type=media_type,
        )


class AsyncConversion:
    def __init__(self, jobs: AsyncJobs, tool: str) -> None:
        self._jobs = jobs
        self._tool = tool

    async def __call__(
        self,
        file: FileInput,
        *,
        options: Mapping[str, object] | None = None,
        idempotency_key: str | None = None,
        media_type: str | None = None,
    ) -> Job:
        return await self._jobs.create(
            tool=self._tool,
            file=file,
            options=options,
            idempotency_key=idempotency_key,
            media_type=media_type,
        )


ConversionType = TypeVar("ConversionType")


class _Conversions(ToolMethods[ConversionType], Generic[ConversionType]):
    def __init__(self, factory: Callable[[str], ConversionType]) -> None:
        for method_name, tool_name in CONVERSION_TOOLS.items():
            setattr(self, method_name, factory(tool_name))


class Conversions(_Conversions[Conversion]):
    def __init__(self, jobs: Jobs) -> None:
        super().__init__(lambda tool: Conversion(jobs, tool))


class AsyncConversions(_Conversions[AsyncConversion]):
    def __init__(self, jobs: AsyncJobs) -> None:
        super().__init__(lambda tool: AsyncConversion(jobs, tool))
