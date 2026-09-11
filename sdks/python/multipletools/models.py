from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, Mapping, cast


JobStatus = Literal["QUEUED", "RUNNING", "SUCCESS", "FAILED"]


@dataclass(frozen=True, slots=True)
class Job:
    id: str
    tool_name: str
    tool_version: str
    status: JobStatus
    progress: int
    input_filename: str
    output_filename: str | None
    output_url: str | None
    error: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "Job":
        status = str(data["status"])
        if status not in {"QUEUED", "RUNNING", "SUCCESS", "FAILED"}:
            raise ValueError(f"Unknown job status: {status}")
        progress = int(data["progress"])
        if not 0 <= progress <= 100:
            raise ValueError("Job progress must be between 0 and 100")
        return cls(
            id=str(data["id"]),
            tool_name=str(data["tool_name"]),
            tool_version=str(data["tool_version"]),
            status=cast(JobStatus, status),
            progress=progress,
            input_filename=str(data["input_filename"]),
            output_filename=_optional_string(data.get("output_filename")),
            output_url=_optional_string(data.get("output_url")),
            error=_optional_string(data.get("error")),
            created_at=_datetime(data["created_at"]),
            started_at=_optional_datetime(data.get("started_at")),
            completed_at=_optional_datetime(data.get("completed_at")),
        )


@dataclass(frozen=True, slots=True)
class Tool:
    name: str
    version: str
    description: str
    input_suffixes: tuple[str, ...]
    input_media_types: tuple[str, ...]
    output_suffix: str
    output_media_type: str

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "Tool":
        return cls(
            name=str(data["name"]),
            version=str(data["version"]),
            description=str(data["description"]),
            input_suffixes=tuple(str(value) for value in data["input_suffixes"]),
            input_media_types=tuple(
                str(value) for value in data["input_media_types"]
            ),
            output_suffix=str(data["output_suffix"]),
            output_media_type=str(data["output_media_type"]),
        )


def _datetime(value: Any) -> datetime:
    if not isinstance(value, str):
        raise ValueError("Expected an ISO-8601 datetime string")
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _optional_datetime(value: Any) -> datetime | None:
    return None if value is None else _datetime(value)


def _optional_string(value: Any) -> str | None:
    return None if value is None else str(value)
