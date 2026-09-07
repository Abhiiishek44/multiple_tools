from datetime import datetime

from pydantic import BaseModel

from packages.core.models import Job


class JobResponse(BaseModel):
    id: str
    tool_name: str
    tool_version: str
    status: str
    progress: int
    input_filename: str
    output_filename: str | None
    output_url: str | None
    error: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

    @classmethod
    def from_job(cls, job: Job) -> "JobResponse":
        return cls(
            id=job.id,
            tool_name=job.tool_name,
            tool_version=job.tool_version,
            status=job.status,
            progress=job.progress,
            input_filename=job.input_filename,
            output_filename=job.output_filename,
            output_url=f"/v1/jobs/{job.id}/output" if job.status == "SUCCESS" else None,
            error=job.error,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
        )
