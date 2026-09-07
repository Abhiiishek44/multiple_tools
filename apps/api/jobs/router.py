from collections.abc import Iterator
from typing import Annotated, BinaryIO
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask

from apps.api.dependencies import current_user_dependency
from apps.api.jobs.schema import JobResponse
from apps.api.services.job_service import find_job, output_reader
from packages.core.exceptions import ConflictError, NotFoundError
from packages.core.models import User

router = APIRouter(prefix="/v1/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    current_user: Annotated[User, Depends(current_user_dependency)],
) -> JobResponse:
    try:
        return JobResponse.from_job(find_job(job_id, current_user.id))
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/{job_id}/output", response_class=StreamingResponse)
def download_output(
    job_id: str,
    current_user: Annotated[User, Depends(current_user_dependency)],
) -> StreamingResponse:
    try:
        reader, filename, media_type = output_reader(job_id, current_user.id)
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return StreamingResponse(
        _read_chunks(reader),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"},
        background=BackgroundTask(reader.close),
    )


def _read_chunks(reader: BinaryIO) -> Iterator[bytes]:
    while chunk := reader.read(1024 * 1024):
        yield chunk
