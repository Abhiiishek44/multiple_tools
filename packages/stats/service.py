import json
import logging

from redis.exceptions import RedisError

from infrastructure.cache import get_redis
from packages.stats import repository
from packages.stats.models import PublicStats, ToolConversionStats

logger = logging.getLogger(__name__)
CACHE_KEY = "stats:public:v1"
CACHE_TTL_SECONDS = 30


def get_public_stats() -> PublicStats:
    cached = _get_cached()
    if cached is not None:
        return cached
    stats = repository.get_public_stats()
    _set_cached(stats)
    return stats


def _get_cached() -> PublicStats | None:
    try:
        payload = get_redis().get(CACHE_KEY)
        if payload is None:
            return None
        data = json.loads(payload)
        return PublicStats(
            total_conversions=int(data["total_conversions"]),
            today_conversions=int(data["today_conversions"]),
            successful_conversions=int(data["successful_conversions"]),
            per_tool={
                slug: ToolConversionStats(
                    total=int(values["total"]),
                    successful=int(values["successful"]),
                )
                for slug, values in data["per_tool"].items()
            },
        )
    except (RedisError, AttributeError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        logger.warning("Public statistics cache read failed", exc_info=True)
        return None


def _set_cached(stats: PublicStats) -> None:
    payload = {
        "total_conversions": stats.total_conversions,
        "today_conversions": stats.today_conversions,
        "successful_conversions": stats.successful_conversions,
        "per_tool": {
            slug: {"total": values.total, "successful": values.successful}
            for slug, values in stats.per_tool.items()
        },
    }
    try:
        get_redis().setex(CACHE_KEY, CACHE_TTL_SECONDS, json.dumps(payload))
    except RedisError:
        logger.warning("Public statistics cache write failed", exc_info=True)
