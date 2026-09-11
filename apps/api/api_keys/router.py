from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from apps.api.api_keys.schemas import (
    ApiKeyCreateRequest,
    ApiKeyCreateResponse,
    ApiKeyResponse,
)
from apps.api.dependencies import current_user_dependency
from packages.api_keys import service
from packages.auth.models import User
from packages.core.errors import NotFoundError, ValidationError


router = APIRouter(prefix="/v1/api-keys", tags=["api-keys"])


@router.post("", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    request: ApiKeyCreateRequest,
    response: Response,
    user: Annotated[User, Depends(current_user_dependency)],
) -> ApiKeyCreateResponse:
    try:
        created = service.create_api_key(
            owner_id=user.id,
            name=request.name,
            scopes=set(request.scopes),
            expires_at=request.expires_at,
        )
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return ApiKeyCreateResponse.from_created(created.api_key, created.raw_key)


@router.get("", response_model=list[ApiKeyResponse])
def list_api_keys(
    user: Annotated[User, Depends(current_user_dependency)],
) -> list[ApiKeyResponse]:
    return [
        ApiKeyResponse.from_api_key(api_key)
        for api_key in service.list_api_keys(user.id)
    ]


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    key_id: str,
    user: Annotated[User, Depends(current_user_dependency)],
) -> Response:
    try:
        service.revoke_api_key(key_id, user.id)
    except NotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
