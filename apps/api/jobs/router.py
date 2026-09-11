from collections.abc import Iterator
from ipaddress import ip_address
from typing import Annotated, BinaryIO
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask

from apps.api.dependencies import principal_with_scope
from apps.api.jobs.schema import JobResponse
from apps.api.services.job_service import find_job, output_reader, submit_job
from packages.auth.principal import Principal
from packages.auth.scopes import JOBS_CREATE, JOBS_DOWNLOAD, JOBS_READ
from packages.core.errors import ConflictError, NotFoundError, ValidationError

router = APIRouter(prefix="/v1/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_job(
    request: Request,
    principal: Annotated[Principal, Depends(principal_with_scope(JOBS_CREATE))],
    tool: Annotated[str, Form(min_length=1, max_length=100)],
    file: Annotated[UploadFile, File()],
    options: Annotated[str | None, Form()] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> JobResponse:
    try:
        job = submit_job(
            tool_name=tool,
            filename=file.filename,
            media_type=file.content_type,
            stream=file.file,
            principal=principal,
            client_ip=_client_ip(request),
            user_agent=request.headers.get("user-agent"),
            options_json=options,
            idempotency_key=idempotency_key,
        )
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return JobResponse.from_job(job)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    principal: Annotated[Principal, Depends(principal_with_scope(JOBS_READ))],
) -> JobResponse:
    try:
        return JobResponse.from_job(find_job(job_id, principal=principal))
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/{job_id}/output", response_class=StreamingResponse)
def download_output(
    job_id: str,
    principal: Annotated[Principal, Depends(principal_with_scope(JOBS_DOWNLOAD))],
) -> StreamingResponse:
    try:
        reader, filename, media_type = output_reader(job_id, principal=principal)
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


def _client_ip(request: Request) -> str | None:
    if request.client is None:
        return None
    try:
        return str(ip_address(request.client.host))
    except ValueError:
        return None
