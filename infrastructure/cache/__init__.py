"""Shared cache clients."""

from infrastructure.cache.redis import get_redis

__all__ = ["get_redis"]
