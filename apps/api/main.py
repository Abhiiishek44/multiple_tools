from collections.abc import Awaitable, Callable
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

from apps.api.api_keys.router import router as api_keys_router
from apps.api.auth.router import router as auth_router
from apps.api.health.router import router as health_router
from apps.api.jobs.router import router as jobs_router
from apps.api.tools.router import router as tools_router
from packages.core.config import get_settings
from packages.core.logging import configure_logging

configure_logging()
settings = get_settings()
settings.validate_api()
app = FastAPI(title="Multiple Tools API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def request_id_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    request_id = request.headers.get("x-request-id")
    if request_id is None or not _valid_request_id(request_id):
        request_id = uuid4().hex
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


def _valid_request_id(value: str) -> bool:
    return 0 < len(value) <= 128 and value.isascii() and value.isprintable()


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(api_keys_router)
app.include_router(tools_router)
app.include_router(jobs_router)
