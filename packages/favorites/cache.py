import json
import logging

from redis.exceptions import RedisError

from infrastructure.cache import get_redis
from packages.core.config import get_settings

logger = logging.getLogger(__name__)
KEY_PREFIX = "favorites:v1"


def get(user_id: str) -> tuple[str, ...] | None:
    try:
        payload = get_redis().get(_key(user_id))
        if payload is None:
            return None
        decoded = json.loads(payload)
        if not isinstance(decoded, list) or not all(isinstance(item, str) for item in decoded):
            delete(user_id)
            return None
        return tuple(decoded)
    except (RedisError, json.JSONDecodeError, TypeError):
        logger.warning("Favorites cache read failed", exc_info=True)
        return None


def set(user_id: str, tool_slugs: tuple[str, ...]) -> None:
    try:
        get_redis().setex(
            _key(user_id),
            get_settings().favorites_cache_ttl_seconds,
            json.dumps(tool_slugs),
        )
    except RedisError:
        logger.warning("Favorites cache write failed", exc_info=True)


def delete(user_id: str) -> None:
    try:
        get_redis().delete(_key(user_id))
    except RedisError:
        logger.warning("Favorites cache invalidation failed", exc_info=True)


def _key(user_id: str) -> str:
    return f"{KEY_PREFIX}:{user_id}"
