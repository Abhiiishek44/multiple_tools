from fastapi import FastAPI

from apps.api.routers.health import router as health_router
from apps.api.routers.jobs import router as jobs_router
from apps.api.routers.tools import router as tools_router
from packages.core.logging import configure_logging

configure_logging()
app = FastAPI(title="Multiple Tools API", version="1.0.0")
app.include_router(health_router)
app.include_router(tools_router)
app.include_router(jobs_router)
