"""Apply versioned SQL migrations exactly once."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

import psycopg


MIGRATIONS_DIRECTORY = (
    Path(__file__).resolve().parents[1] / "infrastructure" / "migrations"
)
LOCK_NAME = "multiple-tools-schema-migrations"


def _checksum(contents: bytes) -> str:
    return hashlib.sha256(contents).hexdigest()


def _migration_body(contents: str) -> str:
    """Remove an optional outer transaction; the runner owns the transaction."""
    stripped = contents.strip()
    if stripped.upper().startswith("BEGIN;") and stripped.upper().endswith("COMMIT;"):
        return stripped[len("BEGIN;") : -len("COMMIT;")].strip()
    return stripped


def apply_migrations(
    database_url: str, directory: Path = MIGRATIONS_DIRECTORY
) -> None:
    migrations = sorted(directory.glob("*.sql"))
    if not migrations:
        raise RuntimeError(f"No SQL migrations found in {directory}")

    with psycopg.connect(database_url, autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_advisory_lock(hashtext(%s))", (LOCK_NAME,))
            try:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS schema_migrations (
                        filename text PRIMARY KEY,
                        checksum text NOT NULL,
                        applied_at timestamptz NOT NULL DEFAULT NOW()
                    )
                    """
                )

                cursor.execute("SELECT filename, checksum FROM schema_migrations")
                applied = dict(cursor.fetchall())

                for migration in migrations:
                    contents = migration.read_bytes()
                    checksum = _checksum(contents)
                    previous_checksum = applied.get(migration.name)

                    if previous_checksum is not None:
                        if previous_checksum != checksum:
                            raise RuntimeError(
                                f"Applied migration {migration.name} has been modified"
                            )
                        print(f"Already applied: {migration.name}")
                        continue

                    print(f"Applying: {migration.name}")
                    cursor.execute("BEGIN")
                    try:
                        cursor.execute(_migration_body(contents.decode("utf-8")))
                        cursor.execute(
                            """
                            INSERT INTO schema_migrations (filename, checksum)
                            VALUES (%s, %s)
                            """,
                            (migration.name, checksum),
                        )
                        cursor.execute("COMMIT")
                    except Exception:
                        cursor.execute("ROLLBACK")
                        raise
            finally:
                cursor.execute(
                    "SELECT pg_advisory_unlock(hashtext(%s))", (LOCK_NAME,)
                )


def main() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    apply_migrations(database_url)


if __name__ == "__main__":
    main()
