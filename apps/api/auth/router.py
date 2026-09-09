from hmac import compare_digest
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Form, HTTPException, Response
from fastapi.responses import RedirectResponse

from apps.api.auth.schema import AuthResponse, GoogleAuthRequest, UserResponse
from apps.api.dependencies import current_user_dependency
from apps.api.services.auth_service import authenticate_google
from packages.auth.models import User
from packages.core.config import get_settings
from packages.core.errors import (
    AuthenticationError,
    AuthenticationUnavailableError,
)


router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/google", response_model=AuthResponse)
def google_authentication(request: GoogleAuthRequest) -> AuthResponse:
    try:
        return authenticate_google(request.id_token)
    except AuthenticationError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error
    except AuthenticationUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post("/google/callback", response_class=RedirectResponse)
def google_redirect_callback(
    credential: Annotated[str, Form(min_length=1, max_length=10_000)],
    g_csrf_token: Annotated[str, Form(min_length=1, max_length=1_000)],
    csrf_cookie: Annotated[str | None, Cookie(alias="g_csrf_token")] = None,
) -> RedirectResponse:
    if not csrf_cookie or not compare_digest(csrf_cookie, g_csrf_token):
        raise HTTPException(status_code=400, detail="Invalid Google CSRF token")
    try:
        authentication = authenticate_google(credential)
    except AuthenticationError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error
    except AuthenticationUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    settings = get_settings()
    dashboard_url = f"{settings.frontend_url.rstrip('/')}/dashboard"
    response = RedirectResponse(dashboard_url, status_code=303)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=authentication.access_token,
        max_age=authentication.expires_in,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
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
        samesite="lax",
    )
    return response
