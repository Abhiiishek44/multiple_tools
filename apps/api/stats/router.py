from fastapi import APIRouter

from apps.api.stats.schemas import PublicStatsResponse
from packages.stats import service

router = APIRouter(prefix="/v1/stats", tags=["stats"])


@router.get("/public", response_model=PublicStatsResponse)
def public_stats() -> PublicStatsResponse:
    return PublicStatsResponse.from_stats(service.get_public_stats())
