import json
import logging
from pathlib import Path
from typing import BinaryIO
from uuid import uuid4

from packages.core.config import get_settings
from packages.core.errors import ConflictError, NotFoundError, ValidationError
from packages.jobs import repository as job_repository
from packages.jobs.models import Job
from plugins.registry import get_plugin
from packages.task_queue import celery_app
from packages.storage import get_storage


logger = logging.getLogger(__name__)


def submit_job(
    *,
    tool_name: str,
    filename: str | None,
    media_type: str | None,
    stream: BinaryIO,
    user_id: str,
    client_ip: str | None = None,
    user_agent: str | None = None,
    options_json: str | None = None,
    idempotency_key: str | None = None,
) -> Job:
    options = _parse_options(options_json)
    if idempotency_key:
        existing = job_repository.get_job_by_idempotency_key(
            user_id, idempotency_key
        )
        if existing:
            if existing.tool_name != tool_name:
                raise ConflictError("Idempotency key belongs to a different tool")
            logger.info(
                "Reusing job id=%s tool=%s for idempotent request",
                existing.id,
                existing.tool_name,
            )
            return existing
    try:
        plugin = get_plugin(tool_name)
    except KeyError as error:
        raise ValidationError(str(error)) from error
    suffix = Path(filename or "").suffix.lower()
    if suffix not in plugin.manifest.input_suffixes:
        expected = ", ".join(sorted(plugin.manifest.input_suffixes))
        raise ValidationError(f"Plugin '{tool_name}' expects one of: {expected}")
    normalized_media_type = (media_type or "").partition(";")[0].strip().lower()
    if normalized_media_type not in plugin.manifest.input_media_types:
        expected = ", ".join(sorted(plugin.manifest.input_media_types))
        raise ValidationError(f"Plugin '{tool_name}' expects media type: {expected}")

    job_id = uuid4().hex
    settings = get_settings()
    artifact_key = f"{settings.minio_temp_prefix}{job_id}/input{suffix}"
    storage = get_storage()
    try:
        storage.save_stream(artifact_key, stream, settings.max_upload_bytes)
    except ValueError as error:
        raise ValidationError(str(error)) from error
    job: Job | None = None
    try:
        job = job_repository.create_job(
            job_id=job_id,
            tool_name=plugin.manifest.name,
            tool_version=plugin.manifest.version,
            input_artifact_key=artifact_key,
            input_filename=Path(filename or f"input{suffix}").name,
            input_media_type=normalized_media_type,
            options=options,
            user_id=user_id,
            client_ip=client_ip,
            user_agent=user_agent[:2000] if user_agent else None,
            idempotency_key=idempotency_key,
        )
        celery_app.send_task("tools.execute", args=[job.id], task_id=job.id)
        logger.info("Queued job id=%s tool=%s", job.id, job.tool_name)
        return job
    except Exception as error:
        if job is not None:
            job_repository.mark_failed(job.id, f"Queue dispatch failed: {error}")
        storage.delete(artifact_key)
        logger.exception(
            "Failed to create or dispatch job id=%s tool=%s", job_id, tool_name
        )
        raise


def _parse_options(raw: str | None) -> dict[str, object]:
    if raw is None or not raw.strip():
        return {}
    if len(raw) > 10_000:
        raise ValidationError("Job options are too large")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as error:
        raise ValidationError("Options must be valid JSON") from error
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ValidationError("Options must be a JSON object")
    return value


def find_job(job_id: str, user_id: str) -> Job:
    job = job_repository.get_job_for_user(job_id, user_id)
    if job is None:
        raise NotFoundError(f"Job not found: {job_id}")
    return job


def output_reader(job_id: str, user_id: str) -> tuple[BinaryIO, str, str]:
    job = find_job(job_id, user_id)
    if job.status != "SUCCESS" or not job.output_artifact_key:
        raise ConflictError("Job output is not available")
    storage = get_storage()
    if not storage.exists(job.output_artifact_key):
        raise NotFoundError("Job output artifact is no longer available")
    return (
        storage.open_reader(job.output_artifact_key),
        job.output_filename or f"output-{job.id}",
        job.output_media_type or "application/octet-stream",
    )
