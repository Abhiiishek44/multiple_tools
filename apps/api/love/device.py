from uuid import UUID, uuid4

from fastapi import Request, Response

from packages.core.config import get_settings

DEVICE_COOKIE = "lmd_love_device"
DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365


def existing_device_id(request: Request) -> str | None:
    value = request.cookies.get(DEVICE_COOKIE)
    if not value:
        return None
    try:
        return str(UUID(value))
    except ValueError:
        return None


def get_or_create_device_id(request: Request) -> tuple[str, bool]:
    device_id = existing_device_id(request)
    return (device_id, False) if device_id else (str(uuid4()), True)


def set_device_cookie(response: Response, device_id: str) -> None:
    settings = get_settings()
    response.set_cookie(
        DEVICE_COOKIE,
        device_id,
        max_age=DEVICE_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/",
    )
