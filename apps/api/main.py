from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.auth.router import router as auth_router
from apps.api.health.router import router as health_router
from apps.api.jobs.router import router as jobs_router
from apps.api.tools.router import router as tools_router
from packages.core.config import get_settings
from packages.core.logging import configure_logging

configure_logging()
app = FastAPI(title="Multiple Tools API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_settings().cors_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(tools_router)
app.include_router(jobs_router)
