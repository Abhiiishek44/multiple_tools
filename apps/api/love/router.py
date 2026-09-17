from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from apps.api.love.device import get_or_create_device_id, set_device_cookie
from apps.api.love.schemas import LoveStatusResponse
from packages.auth import repository as user_repository
from packages.auth.jwt import decode_access_token
from packages.auth.models import User
from packages.core.config import get_settings
from packages.core.errors import AuthenticationError
from packages.love import service

router = APIRouter(prefix="/v1/love", tags=["love"])


def optional_session_user(request: Request) -> User | None:
    token = request.cookies.get(get_settings().auth_cookie_name)
    if not token:
        return None
    try:
        return user_repository.get_user(decode_access_token(token))
    except AuthenticationError:
        return None


@router.get("", response_model=LoveStatusResponse)
def get_love_status(
    request: Request,
    response: Response,
    user: Annotated[User | None, Depends(optional_session_user)],
) -> LoveStatusResponse:
    device_id, is_new = get_or_create_device_id(request)
    if is_new:
        set_device_cookie(response, device_id)
    return LoveStatusResponse.from_status(
        service.get_status(user_id=user.id if user else None, device_id=device_id)
    )


@router.post("", response_model=LoveStatusResponse)
def send_love(
    request: Request,
    response: Response,
    user: Annotated[User | None, Depends(optional_session_user)],
) -> LoveStatusResponse:
    device_id, is_new = get_or_create_device_id(request)
    if is_new:
        set_device_cookie(response, device_id)
    try:
        status = service.send_love(
            user_id=user.id if user else None,
            device_id=device_id,
            client_ip=request.client.host if request.client else "unknown",
        )
    except service.RateLimitExceededError as error:
        raise HTTPException(status_code=429, detail=str(error)) from error
    return LoveStatusResponse.from_status(status)
