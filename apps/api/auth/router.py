from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response

from apps.api.auth.schema import (
    AuthResponse,
    GoogleAuthRequest,
    GoogleCredentialRequest,
    UserResponse,
)
from apps.api.dependencies import current_user_dependency
from apps.api.services.auth_service import authenticate_google
from packages.auth.models import User
from packages.core.config import get_settings
from packages.core.errors import (
    AuthenticationError,
    AuthenticationUnavailableError,
)


router = APIRouter(prefix="/v1/auth", tags=["auth"])


def _session_cookie_samesite(secure: bool) -> str:
    # The separately hosted Railway web and API services are cross-site.
    # SameSite=None is required for credentialed browser requests in production,
    # while local HTTP development cannot use a Secure cookie.
    return "none" if secure else "lax"


@router.post("/google", response_model=AuthResponse)
def google_authentication(request: GoogleAuthRequest) -> AuthResponse:
    try:
        return authenticate_google(request.id_token)
    except AuthenticationError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error
    except AuthenticationUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post("/google/callback", status_code=204)
def google_redirect_callback(
    request: GoogleCredentialRequest,
) -> Response:
    try:
        authentication = authenticate_google(request.credential)
    except AuthenticationError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error
    except AuthenticationUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    settings = get_settings()
    response = Response(status_code=204)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=authentication.access_token,
        max_age=authentication.expires_in,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=_session_cookie_samesite(settings.auth_cookie_secure),
        path="/",
    )
    return response


@router.get("/me", response_model=UserResponse)
def authenticated_user(
    user: Annotated[User, Depends(current_user_dependency)],
) -> UserResponse:
    return UserResponse.from_user(user)


@router.post("/logout", status_code=204)
def logout() -> Response:
    settings = get_settings()
    response = Response(status_code=204)
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path="/",
        secure=settings.auth_cookie_secure,
        httponly=True,
        samesite=_session_cookie_samesite(settings.auth_cookie_secure),
    )
    return response
