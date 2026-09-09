from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from packages.auth import repository as user_repository
from packages.auth.jwt import decode_access_token
from packages.auth.models import User
from packages.core.config import get_settings
from packages.core.errors import AuthenticationError
from packages.storage import get_storage
from packages.storage.base import ArtifactStorage


bearer_scheme = HTTPBearer(auto_error=False)


def storage_dependency() -> ArtifactStorage:
    return get_storage()


def current_user_dependency(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> User:
    if credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    else:
        token = request.cookies.get(get_settings().auth_cookie_name)
    if not token:
        raise _unauthorized("Authentication is required")
    try:
        user_id = decode_access_token(token)
    except AuthenticationError as error:
        raise _unauthorized(str(error)) from error
    user = user_repository.get_user(user_id)
    if user is None:
        raise _unauthorized("Access token user no longer exists")
    return user


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
