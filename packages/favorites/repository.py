from collections.abc import Iterable, Mapping
from typing import Any

from infrastructure.database import database_connection
from packages.favorites.models import Favorite


def list_for_user(user_id: str) -> tuple[Favorite, ...]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT user_id, tool_slug, created_at
            FROM user_favorites
            WHERE user_id = %s
            ORDER BY created_at, tool_slug
            """,
            (user_id,),
        ).fetchall()
    return tuple(_to_favorite(row) for row in rows)


def add(user_id: str, tool_slug: str) -> Favorite:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO user_favorites (user_id, tool_slug)
            VALUES (%s, %s)
            ON CONFLICT (user_id, tool_slug) DO UPDATE
                SET tool_slug = EXCLUDED.tool_slug
            RETURNING user_id, tool_slug, created_at
            """,
            (user_id, tool_slug),
        ).fetchone()
    return _to_favorite(row)


def add_many(user_id: str, tool_slugs: Iterable[str]) -> None:
    values = [(user_id, slug) for slug in tool_slugs]
    if not values:
        return
    with database_connection() as connection:
        with connection.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO user_favorites (user_id, tool_slug)
                VALUES (%s, %s)
                ON CONFLICT (user_id, tool_slug) DO NOTHING
                """,
                values,
            )


def remove(user_id: str, tool_slug: str) -> bool:
    with database_connection() as connection:
        result = connection.execute(
            "DELETE FROM user_favorites WHERE user_id = %s AND tool_slug = %s",
            (user_id, tool_slug),
        )
    return result.rowcount > 0


def _to_favorite(row: Mapping[str, Any]) -> Favorite:
    return Favorite(
        user_id=str(row["user_id"]),
        tool_slug=str(row["tool_slug"]),
        created_at=row["created_at"],
    )
