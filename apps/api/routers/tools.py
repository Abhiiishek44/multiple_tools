from typing import Annotated

from fastapi import APIRouter, File, Header, HTTPException, UploadFile, status

from apps.api.schemas.jobs import JobResponse
from apps.api.schemas.tools import ToolResponse
from apps.api.services.job_service import submit_job
from apps.api.services.tool_service import available_tools
from packages.core.exceptions import ConflictError, ValidationError

router = APIRouter(prefix="/v1/tools", tags=["tools"])


@router.get("")
def list_tools() -> list[ToolResponse]:
    return [ToolResponse.model_validate(tool) for tool in available_tools()]


@router.post("/{tool_name}/jobs", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_job(
    tool_name: str,
    file: Annotated[UploadFile, File()],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> JobResponse:
    try:
        job = submit_job(
            tool_name=tool_name,
            filename=file.filename,
            media_type=file.content_type,
            stream=file.file,
            idempotency_key=idempotency_key,
        )
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return JobResponse.from_job(job)
