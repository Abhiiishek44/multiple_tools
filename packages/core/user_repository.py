from collections.abc import Mapping
from typing import Any

from packages.core.database import database_connection
from packages.core.models import User


def upsert_google_user(
    *, google_sub: str, email: str, name: str, picture_url: str | None
) -> User:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO users (google_sub, email, name, picture_url)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (google_sub) DO UPDATE
            SET email = EXCLUDED.email,
                name = EXCLUDED.name,
                picture_url = EXCLUDED.picture_url,
                updated_at = NOW()
            RETURNING *
            """,
            (google_sub, email, name, picture_url),
        ).fetchone()
    return _to_user(row)


def get_user(user_id: str) -> User | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE id = %s", (user_id,)
        ).fetchone()
    return _to_user(row) if row else None


def _to_user(row: Mapping[str, Any]) -> User:
    values = {field: row[field] for field in User.__dataclass_fields__}
    values["id"] = str(values["id"])
    return User(**values)
