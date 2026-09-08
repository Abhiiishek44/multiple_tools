from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt

from packages.config import Settings, get_settings
from packages.exceptions import AuthenticationError


def create_access_token(user_id: str, settings: Settings | None = None) -> str:
    configuration = settings or get_settings()
    secret = _jwt_secret(configuration)
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": user_id,
            "iss": configuration.jwt_issuer,
            "aud": configuration.jwt_audience,
            "iat": now,
            "exp": now + timedelta(minutes=configuration.jwt_expiration_minutes),
            "jti": uuid4().hex,
        },
        secret,
        algorithm="HS256",
    )


def decode_access_token(token: str, settings: Settings | None = None) -> str:
    configuration = settings or get_settings()
    secret = _jwt_secret(configuration)
    try:
        claims = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience=configuration.jwt_audience,
            issuer=configuration.jwt_issuer,
            options={"require": ["sub", "iss", "aud", "iat", "exp", "jti"]},
        )
    except jwt.InvalidTokenError as error:
        raise AuthenticationError("Invalid or expired access token") from error
    user_id = claims.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise AuthenticationError("Invalid access token subject")
    return user_id


def _jwt_secret(settings: Settings) -> str:
    if not settings.jwt_secret or len(settings.jwt_secret) < 32:
        raise RuntimeError("JWT_SECRET must contain at least 32 characters")
    return settings.jwt_secret
