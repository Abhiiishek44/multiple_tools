from collections.abc import Mapping
from typing import Any

from psycopg.types.json import Jsonb

from packages.database import database_connection
from packages.jobs.models import Job


def create_job(
    *,
    job_id: str,
    tool_name: str,
    tool_version: str,
    input_artifact_key: str,
    input_filename: str,
    input_media_type: str | None,
    options: dict[str, object],
    user_id: str,
    client_ip: str | None,
    user_agent: str | None,
    idempotency_key: str | None,
) -> Job:
    with database_connection() as connection:
        row = connection.execute(
            """
            INSERT INTO tool_jobs (
                id, tool_name, tool_version, input_artifact_key,
                input_filename, input_media_type, options, user_id,
                client_ip, user_agent, idempotency_key
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                job_id,
                tool_name,
                tool_version,
                input_artifact_key,
                input_filename,
                input_media_type,
                Jsonb(options),
                user_id,
                client_ip,
                user_agent,
                idempotency_key,
            ),
        ).fetchone()
    return _to_job(row)


def get_job(job_id: str) -> Job | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM tool_jobs WHERE id = %s", (job_id,)
        ).fetchone()
    return _to_job(row) if row else None


def get_job_for_user(job_id: str, user_id: str) -> Job | None:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM tool_jobs WHERE id = %s AND user_id = %s",
            (job_id, user_id),
        ).fetchone()
    return _to_job(row) if row else None


def get_job_by_idempotency_key(user_id: str, key: str) -> Job | None:
    with database_connection() as connection:
        row = connection.execute(
            """
            SELECT * FROM tool_jobs
            WHERE user_id = %s AND idempotency_key = %s
            """,
            (user_id, key),
        ).fetchone()
    return _to_job(row) if row else None


def mark_running(job_id: str) -> Job | None:
    return _update_and_return(
        """
        UPDATE tool_jobs
        SET status = 'RUNNING', progress = GREATEST(progress, 1), started_at = NOW()
        WHERE id = %s AND status = 'QUEUED'
        RETURNING *
        """,
        (job_id,),
    )


def update_progress(job_id: str, progress: int) -> None:
    bounded = max(1, min(progress, 99))
    with database_connection() as connection:
        connection.execute(
            """
            UPDATE tool_jobs SET progress = %s
            WHERE id = %s AND status = 'RUNNING'
            """,
            (bounded, job_id),
        )


def mark_succeeded(
    job_id: str,
    *,
    artifact_key: str,
    filename: str,
    media_type: str,
) -> Job | None:
    return _update_and_return(
        """
        UPDATE tool_jobs
        SET status = 'SUCCESS', progress = 100,
            output_artifact_key = %s, output_filename = %s, output_media_type = %s,
            completed_at = NOW(), error = NULL, options = '{}'::jsonb
        WHERE id = %s AND status = 'RUNNING'
        RETURNING *
        """,
        (artifact_key, filename, media_type, job_id),
    )


def mark_failed(job_id: str, error: str) -> Job | None:
    return _update_and_return(
        """
        UPDATE tool_jobs
        SET status = 'FAILED', error = %s, completed_at = NOW(), options = '{}'::jsonb
        WHERE id = %s AND status IN ('QUEUED', 'RUNNING')
        RETURNING *
        """,
        (error[:4000], job_id),
    )


def _update_and_return(query: str, parameters: tuple[Any, ...]) -> Job | None:
    with database_connection() as connection:
        row = connection.execute(query, parameters).fetchone()
    return _to_job(row) if row else None


def _to_job(row: Mapping[str, Any]) -> Job:
    values = {field: row[field] for field in Job.__dataclass_fields__}
    values["id"] = str(values["id"])
    if values["client_ip"] is not None:
        values["client_ip"] = str(values["client_ip"])
    return Job(**values)
