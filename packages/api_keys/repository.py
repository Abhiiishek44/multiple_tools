from collections.abc import Mapping
from datetime import datetime
from typing import Any

from packages.api_keys.models import ApiKey
from packages.database import database_connection


def create_api_key(
    *,
    key_id: str,
    secret_hash: str,
    owner_id: str,
    name: str,
    scopes: frozenset[str],
    expires_at: datetime | None,
) -> ApiKey:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO api_keys (
                key_id, secret_hash, owner_id, name, scopes, expires_at
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (key_id, secret_hash, owner_id, name, sorted(scopes), expires_at),
        ).fetchone()
    return _to_api_key(row)


def get_api_key(key_id: str) -> ApiKey | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM api_keys WHERE key_id = %s", (key_id,)
        ).fetchone()
    return _to_api_key(row) if row else None


def list_api_keys_for_owner(owner_id: str) -> tuple[ApiKey, ...]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM api_keys
            WHERE owner_id = %s
            ORDER BY created_at DESC, key_id
            """,
            (owner_id,),
        ).fetchall()
    return tuple(_to_api_key(row) for row in rows)


def mark_used(key_id: str, used_at: datetime) -> None:
    with database_connection() as connection:
        connection.execute(
            """
            UPDATE api_keys SET last_used_at = %s
            WHERE key_id = %s AND revoked_at IS NULL
            """,
            (used_at, key_id),
        )


def revoke_api_key(key_id: str, owner_id: str, revoked_at: datetime) -> ApiKey | None:
    with database_connection() as connection:
        row = connection.execute(
            """
            UPDATE api_keys SET revoked_at = %s
            WHERE key_id = %s AND owner_id = %s AND revoked_at IS NULL
            RETURNING *
            """,
            (revoked_at, key_id, owner_id),
        ).fetchone()
    return _to_api_key(row) if row else None


def _to_api_key(row: Mapping[str, Any]) -> ApiKey:
    values = {field: row[field] for field in ApiKey.__dataclass_fields__}
    values["owner_id"] = str(values["owner_id"])
    values["scopes"] = frozenset(values["scopes"])
    return ApiKey(**values)
