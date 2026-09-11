from ipaddress import ip_address
from typing import Annotated

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

from apps.api.dependencies import (
    optional_bearer_principal_dependency,
    principal_with_scope,
)
from apps.api.jobs.schema import JobResponse
from apps.api.services.job_service import submit_job
from apps.api.services.tool_service import available_tools
from apps.api.tools.schema import ToolResponse
from packages.auth.principal import Principal
from packages.auth.scopes import JOBS_CREATE, TOOLS_READ
from packages.core.errors import ConflictError, ValidationError

router = APIRouter(prefix="/v1/tools", tags=["tools"])


@router.get("")
def list_tools(
    principal: Annotated[
        Principal | None, Depends(optional_bearer_principal_dependency)
    ],
) -> list[ToolResponse]:
    # Preserve the existing anonymous web catalog. Authenticated API clients
    # must still declare their intent through the tools:read scope.
    if principal is not None and not principal.has_scope(TOOLS_READ):
        raise HTTPException(
            status_code=403, detail=f"API key requires scope: {TOOLS_READ}"
        )
    return [ToolResponse.model_validate(tool) for tool in available_tools()]


@router.post(
    "/{tool_name}/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def create_job(
    tool_name: str,
    request: Request,
    principal: Annotated[Principal, Depends(principal_with_scope(JOBS_CREATE))],
    file: Annotated[UploadFile, File()],
    options: Annotated[str | None, Form()] = None,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> JobResponse:
    try:
        job = submit_job(
            tool_name=tool_name,
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


def _client_ip(request: Request) -> str | None:
    if request.client is None:
        return None
    try:
        return str(ip_address(request.client.host))
    except ValueError:
        return None
