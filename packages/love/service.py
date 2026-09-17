import hashlib
import hmac
import logging

from redis.exceptions import RedisError

from infrastructure.cache import get_redis
from packages.core.config import get_settings
from packages.love import repository
from packages.love.models import LoveStatus

logger = logging.getLogger(__name__)


class RateLimitExceededError(Exception):
    pass


def get_status(*, user_id: str | None, device_id: str) -> LoveStatus:
    return repository.get_status(
        user_id=user_id,
        anonymous_id_hash=None if user_id else _device_hash(device_id),
    )


def send_love(*, user_id: str | None, device_id: str, client_ip: str) -> LoveStatus:
    anonymous_hash = None if user_id else _device_hash(device_id)
    current = repository.get_status(
        user_id=user_id, anonymous_id_hash=anonymous_hash
    )
    if current.loved:
        return current
    if user_id is None and not _anonymous_rate_allowed(anonymous_hash, client_ip):
        raise RateLimitExceededError("Please wait before sending more love")
    repository.add(user_id=user_id, anonymous_id_hash=anonymous_hash)
    return repository.get_status(
        user_id=user_id, anonymous_id_hash=anonymous_hash
    )


def merge_anonymous_love(*, user_id: str, device_id: str) -> None:
    repository.merge_anonymous_love(
        user_id=user_id,
        anonymous_id_hash=_device_hash(device_id),
    )


def _device_hash(device_id: str) -> str:
    secret = get_settings().api_key_hmac_secret
    if secret is None:
        raise RuntimeError("API_KEY_HMAC_SECRET is required")
    return hmac.new(secret.encode(), device_id.encode(), hashlib.sha256).hexdigest()


def _anonymous_rate_allowed(device_hash: str, client_ip: str) -> bool:
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    try:
        redis = get_redis()
        with redis.pipeline() as pipeline:
            pipeline.incr(f"love:rate:device:{device_hash}")
            pipeline.expire(f"love:rate:device:{device_hash}", 3600, nx=True)
            pipeline.incr(f"love:rate:ip:{ip_hash}")
            pipeline.expire(f"love:rate:ip:{ip_hash}", 3600, nx=True)
            device_count, _, ip_count, _ = pipeline.execute()
        return int(device_count) <= 3 and int(ip_count) <= 20
    except RedisError:
        logger.warning("Love counter rate limit unavailable", exc_info=True)
        return True
