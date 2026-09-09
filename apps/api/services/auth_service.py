from google.auth.exceptions import TransportError
from google.auth.transport.requests import Request
from google.oauth2 import id_token as google_id_token

from apps.api.auth.schema import AuthResponse, UserResponse
from packages.auth import repository as user_repository
from packages.auth.jwt import create_access_token
from packages.core.config import get_settings
from packages.core.errors import (
    AuthenticationError,
    AuthenticationUnavailableError,
)


def authenticate_google(id_token: str) -> AuthResponse:
    settings = get_settings()
    if not settings.google_client_id:
        raise RuntimeError("GOOGLE_CLIENT_ID is not configured")
    try:
        claims = google_id_token.verify_oauth2_token(
            id_token,
            Request(),
            settings.google_client_id,
        )
    except TransportError as error:
        raise AuthenticationUnavailableError(
            "Google token verification is temporarily unavailable"
        ) from error
    except ValueError as error:
        raise AuthenticationError("Invalid Google ID token") from error

    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise AuthenticationError("Invalid Google token issuer")
    google_sub = claims.get("sub")
    email = claims.get("email")
    if not isinstance(google_sub, str) or not google_sub:
        raise AuthenticationError("Google token has no subject")
    if not isinstance(email, str) or not email or claims.get("email_verified") is not True:
        raise AuthenticationError("Google account email is not verified")

    name_claim = claims.get("name")
    name = name_claim if isinstance(name_claim, str) and name_claim else email
    picture_claim = claims.get("picture")
    picture_url = picture_claim if isinstance(picture_claim, str) else None
    user = user_repository.upsert_google_user(
        google_sub=google_sub,
        email=email,
        name=name,
        picture_url=picture_url,
    )
    return AuthResponse(
        access_token=create_access_token(user.id, settings),
        expires_in=settings.jwt_expiration_minutes * 60,
        user=UserResponse.from_user(user),
    )
