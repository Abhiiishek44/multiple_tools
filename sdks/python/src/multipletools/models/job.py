from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, cast

from multipletools.exceptions import ResponseValidationError

JobStatus = Literal["QUEUED", "RUNNING", "SUCCESS", "FAILED"]
TERMINAL_JOB_STATUSES = frozenset({"SUCCESS", "FAILED"})


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

    @property
    def is_terminal(self) -> bool:
        return self.status in TERMINAL_JOB_STATUSES

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "Job":
        try:
            status = str(data["status"])
            if status not in {"QUEUED", "RUNNING", "SUCCESS", "FAILED"}:
                raise ValueError(f"unknown job status: {status}")
            progress = int(data["progress"])
            if not 0 <= progress <= 100:
                raise ValueError("job progress must be between 0 and 100")
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
        except (KeyError, TypeError, ValueError) as error:
            raise ResponseValidationError(f"Invalid job response: {error}") from error


def _datetime(value: Any) -> datetime:
    if not isinstance(value, str):
        raise ValueError("expected an ISO-8601 datetime string")
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if result.tzinfo is None:
        raise ValueError("datetime must include a timezone")
    return result


def _optional_datetime(value: Any) -> datetime | None:
    return None if value is None else _datetime(value)


def _optional_string(value: Any) -> str | None:
    return None if value is None else str(value)
