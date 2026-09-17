from functools import lru_cache

from redis import Redis

from packages.core.config import get_settings


@lru_cache(maxsize=1)
def get_redis() -> Redis:
    return Redis.from_url(
        get_settings().favorites_redis_url,
        decode_responses=True,
        socket_connect_timeout=1,
        socket_timeout=1,
    )
