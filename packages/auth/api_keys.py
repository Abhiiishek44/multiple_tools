from dataclasses import dataclass
import hashlib
import hmac
import re
import secrets

from packages.core.config import Settings, get_settings
from packages.core.errors import AuthenticationError


_KEY_ID_PATTERN = re.compile(r"^[a-f0-9]{24}$")
_SECRET_PATTERN = re.compile(r"^[A-Za-z0-9_-]{32,128}$")


@dataclass(frozen=True, slots=True)
class GeneratedApiKey:
    key_id: str
    secret_hash: str
    raw_key: str


@dataclass(frozen=True, slots=True)
class ParsedApiKey:
    key_id: str
    secret: str


def generate_api_key(settings: Settings | None = None) -> GeneratedApiKey:
    key_id = secrets.token_hex(12)
    secret = secrets.token_urlsafe(32)
    return GeneratedApiKey(
        key_id=key_id,
        secret_hash=hash_api_key_secret(key_id, secret, settings),
        raw_key=f"mt_live_{key_id}_{secret}",
    )


def parse_api_key(raw_key: str) -> ParsedApiKey:
    parts = raw_key.split("_", 3)
    if (
        len(parts) != 4
        or parts[0] != "mt"
        or parts[1] != "live"
        or not _KEY_ID_PATTERN.fullmatch(parts[2])
        or not _SECRET_PATTERN.fullmatch(parts[3])
    ):
        raise AuthenticationError("Invalid API key")
    return ParsedApiKey(key_id=parts[2], secret=parts[3])


def hash_api_key_secret(
    key_id: str, secret: str, settings: Settings | None = None
) -> str:
    configuration = settings or get_settings()
    pepper = configuration.api_key_hmac_secret
    if not pepper or len(pepper) < 32:
        raise RuntimeError("API_KEY_HMAC_SECRET must contain at least 32 characters")
    message = f"{key_id}.{secret}".encode("utf-8")
    return hmac.new(pepper.encode("utf-8"), message, hashlib.sha256).hexdigest()


def verify_api_key_secret(
    key_id: str,
    secret: str,
    expected_hash: str,
    settings: Settings | None = None,
) -> bool:
    actual_hash = hash_api_key_secret(key_id, secret, settings)
    return hmac.compare_digest(actual_hash, expected_hash)
