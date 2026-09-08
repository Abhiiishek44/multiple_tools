from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Job:
    id: str
    tool_name: str
    tool_version: str
    status: str
    progress: int
    input_artifact_key: str
    input_filename: str
    input_media_type: str | None
    output_artifact_key: str | None
    output_filename: str | None
    output_media_type: str | None
    error: str | None
    idempotency_key: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    options: dict[str, object] = field(default_factory=dict)
    user_id: str | None = None
    client_ip: str | None = None
    user_agent: str | None = None
