from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from packages.auth import repository as user_repository
from packages.api_keys.service import authenticate_api_key
from packages.auth.jwt import decode_access_token
from packages.auth.models import User
from packages.auth.principal import Principal
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


def current_principal_dependency(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> Principal:
    principal = _resolve_principal(request, credentials)
    if principal is None:
        raise _unauthorized("Authentication is required")
    return principal


def optional_bearer_principal_dependency(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> Principal | None:
    # Public endpoints use this variant so an unrelated stale browser cookie
    # cannot turn an otherwise anonymous request into a 401 response.
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    return _principal_from_token(credentials.credentials)


def principal_with_scope(scope: str) -> Callable[..., Principal]:
    def dependency(
        principal: Annotated[Principal, Depends(current_principal_dependency)],
    ) -> Principal:
        if not principal.has_scope(scope):
            raise HTTPException(
                status_code=403,
                detail=f"API key requires scope: {scope}",
            )
        return principal

    return dependency


def _resolve_principal(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> Principal | None:
    if credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    else:
        token = request.cookies.get(get_settings().auth_cookie_name)
    if not token:
        return None
    return _principal_from_token(token)


def _principal_from_token(token: str) -> Principal:
    try:
        if token.startswith("mt_live_"):
            return authenticate_api_key(token)
        user_id = decode_access_token(token)
    except AuthenticationError as error:
        raise _unauthorized(str(error)) from error
    if user_repository.get_user(user_id) is None:
        raise _unauthorized("Access token user no longer exists")
    return Principal.for_user(user_id)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
