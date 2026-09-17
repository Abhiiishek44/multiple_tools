from infrastructure.database import database_connection
from packages.love.models import LoveStatus


def get_status(*, user_id: str | None, anonymous_id_hash: str | None) -> LoveStatus:
    if user_id is not None:
        viewer_predicate = "loves.user_id = %s::uuid"
        viewer_params = (user_id,)
    elif anonymous_id_hash is not None:
        viewer_predicate = """
            loves.anonymous_id_hash = %s::text
            OR EXISTS (
                SELECT 1
                FROM site_love_device_users device_users
                WHERE device_users.anonymous_id_hash = %s::text
            )
        """
        viewer_params = (anonymous_id_hash, anonymous_id_hash)
    else:
        raise ValueError("A user or anonymous identity is required")

    with database_connection() as connection:
        row = connection.execute(
            f"""
            SELECT
                totals.historical_count + COUNT(loves.id) AS count,
                COALESCE(BOOL_OR({viewer_predicate}), FALSE) AS loved
            FROM site_love_totals totals
            LEFT JOIN site_loves loves ON TRUE
            WHERE totals.id = 1
            GROUP BY totals.historical_count
            """,
            viewer_params,
        ).fetchone()
    return LoveStatus(count=int(row["count"]), loved=bool(row["loved"]))


def add(*, user_id: str | None, anonymous_id_hash: str | None) -> bool:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO site_loves (user_id, anonymous_id_hash)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            (user_id, anonymous_id_hash),
        ).fetchone()
    return row is not None


def merge_anonymous_love(*, user_id: str, anonymous_id_hash: str) -> None:
    """Move an anonymous love to a user, removing it if the user already loved."""

    with database_connection() as connection:
        user_love = connection.execute(
            "SELECT id FROM site_loves WHERE user_id = %s::uuid FOR UPDATE",
            (user_id,),
        ).fetchone()
        anonymous_love = connection.execute(
            "SELECT id FROM site_loves WHERE anonymous_id_hash = %s::text FOR UPDATE",
            (anonymous_id_hash,),
        ).fetchone()
        if anonymous_love is None:
            return
        connection.execute(
            """
            INSERT INTO site_love_device_users (anonymous_id_hash, user_id)
            VALUES (%s::text, %s::uuid)
            ON CONFLICT (anonymous_id_hash) DO NOTHING
            """,
            (anonymous_id_hash, user_id),
        )
        if user_love is not None:
            connection.execute(
                "DELETE FROM site_loves WHERE id = %s",
                (anonymous_love["id"],),
            )
            return
        connection.execute(
            """
            UPDATE site_loves
            SET user_id = %s::uuid, anonymous_id_hash = NULL
            WHERE id = %s
            """,
            (user_id, anonymous_love["id"]),
        )
