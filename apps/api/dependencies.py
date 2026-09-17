from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from packages.auth import repository as user_repository
from packages.api_keys.service import authenticate_api_key
from packages.auth.jwt import decode_access_token
from packages.auth.models import User
from packages.auth.actor import AuthenticatedActor
from packages.core.config import get_settings
from packages.core.errors import AuthenticationError
from packages.storage import get_storage
from packages.storage.base import ArtifactStorage


bearer_scheme = HTTPBearer(auto_error=False)


def storage_dependency() -> ArtifactStorage:
    return get_storage()


def require_authenticated_user(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> User:
    """Authenticate a user JWT from the Bearer header or session cookie."""

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


def require_authenticated_actor(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> AuthenticatedActor:
    """Authenticate the user or API key making this request."""

    actor = _authenticate_request(request, credentials)
    if actor is None:
        raise _unauthorized("Authentication is required")
    return actor


def get_optional_bearer_actor(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> AuthenticatedActor | None:
    """Authenticate an optional Bearer token without reading session cookies."""

    # Public endpoints use this variant so an unrelated stale browser cookie
    # cannot turn an otherwise anonymous request into a 401 response.
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    return _authenticate_token(credentials.credentials)


def require_scope(scope: str) -> Callable[..., AuthenticatedActor]:
    """Build a dependency that requires authentication and one permission scope."""

    def dependency(
        actor: Annotated[AuthenticatedActor, Depends(require_authenticated_actor)],
    ) -> AuthenticatedActor:
        if not actor.has_scope(scope):
            raise HTTPException(
                status_code=403,
                detail=f"API key requires scope: {scope}",
            )
        return actor

    return dependency


def _authenticate_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> AuthenticatedActor | None:
    """Select a request credential and authenticate it when present."""

    if credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    else:
        token = request.cookies.get(get_settings().auth_cookie_name)
    if not token:
        return None
    return _authenticate_token(token)


def _authenticate_token(token: str) -> AuthenticatedActor:
    """Authenticate an API key or user JWT and describe its actor."""

    try:
        if token.startswith("mt_live_"):
            return authenticate_api_key(token)
        user_id = decode_access_token(token)
    except AuthenticationError as error:
        raise _unauthorized(str(error)) from error
    if user_repository.get_user(user_id) is None:
        raise _unauthorized("Access token user no longer exists")
    return AuthenticatedActor.for_user(user_id)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
