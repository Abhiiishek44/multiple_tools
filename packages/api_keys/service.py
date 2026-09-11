from dataclasses import dataclass
from datetime import UTC, datetime

from packages.api_keys import repository
from packages.api_keys.models import ApiKey
from packages.auth.api_keys import (
    generate_api_key,
    parse_api_key,
    verify_api_key_secret,
)
from packages.auth.principal import Principal
from packages.auth.scopes import validate_scopes
from packages.core.errors import AuthenticationError, NotFoundError, ValidationError


@dataclass(frozen=True, slots=True)
class CreatedApiKey:
    api_key: ApiKey
    raw_key: str


def create_api_key(
    *,
    owner_id: str,
    name: str,
    scopes: set[str] | frozenset[str],
    expires_at: datetime | None = None,
) -> CreatedApiKey:
    normalized_name = name.strip()
    if not normalized_name:
        raise ValidationError("API key name is required")
    if len(normalized_name) > 100:
        raise ValidationError("API key name cannot exceed 100 characters")
    try:
        normalized_scopes = validate_scopes(scopes)
    except ValueError as error:
        raise ValidationError(str(error)) from error
    normalized_expiry = _normalize_expiry(expires_at)
    generated = generate_api_key()
    stored = repository.create_api_key(
        key_id=generated.key_id,
        secret_hash=generated.secret_hash,
        owner_id=owner_id,
        name=normalized_name,
        scopes=normalized_scopes,
        expires_at=normalized_expiry,
    )
    return CreatedApiKey(api_key=stored, raw_key=generated.raw_key)


def authenticate_api_key(raw_key: str) -> Principal:
    parsed = parse_api_key(raw_key)
    stored = repository.get_api_key(parsed.key_id)
    expected_hash = stored.secret_hash if stored is not None else "0" * 64
    secret_is_valid = verify_api_key_secret(
        parsed.key_id, parsed.secret, expected_hash
    )
    if stored is None or not secret_is_valid:
        raise AuthenticationError("Invalid API key")

    now = datetime.now(UTC)
    if stored.revoked_at is not None:
        raise AuthenticationError("Invalid API key")
    if stored.expires_at is not None and _as_utc(stored.expires_at) <= now:
        raise AuthenticationError("Invalid API key")

    repository.mark_used(stored.key_id, now)
    return Principal.for_api_key(stored.owner_id, stored.key_id, stored.scopes)


def list_api_keys(owner_id: str) -> tuple[ApiKey, ...]:
    return repository.list_api_keys_for_owner(owner_id)


def revoke_api_key(key_id: str, owner_id: str) -> ApiKey:
    revoked = repository.revoke_api_key(key_id, owner_id, datetime.now(UTC))
    if revoked is None:
        raise NotFoundError(f"API key not found: {key_id}")
    return revoked


def _normalize_expiry(expires_at: datetime | None) -> datetime | None:
    if expires_at is None:
        return None
    normalized = _as_utc(expires_at)
    if normalized <= datetime.now(UTC):
        raise ValidationError("API key expiration must be in the future")
    return normalized


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
