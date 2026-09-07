import logging
import tempfile
from pathlib import Path

from celery import shared_task

from packages.core import job_repository
from plugins.base import ToolContext
from plugins.registry import get_plugin
from packages.storage import get_storage


logger = logging.getLogger(__name__)


@shared_task(name="tools.execute", acks_late=True)
def execute_tool(job_id: str) -> dict[str, str]:
    logger.info("Received job id=%s", job_id)
    job = job_repository.get_job(job_id)
    if job is None:
        logger.error("Cannot execute missing job id=%s", job_id)
        raise ValueError(f"Job not found: {job_id}")
    if job_repository.mark_running(job.id) is None:
        logger.info("Skipping unclaimable job id=%s status=%s", job.id, job.status)
        return {"job_id": job.id, "status": job.status}

    output_key: str | None = None
    try:
        plugin = get_plugin(job.tool_name)
        logger.info("Executing job id=%s tool=%s", job.id, job.tool_name)
        storage = get_storage()
        output_key = f"jobs/{job.id}/output{plugin.manifest.output_suffix}"
        with tempfile.TemporaryDirectory(prefix=f"tool-{job.id}-") as directory:
            temporary = Path(directory)
            source = temporary / f"input{Path(job.input_filename).suffix.lower()}"
            destination = temporary / f"output{plugin.manifest.output_suffix}"
            storage.download_file(job.input_artifact_key, source)
            context = ToolContext(
                job_id=job.id,
                report_progress=lambda value: job_repository.update_progress(job.id, value),
                options=job.options,
            )
            output = plugin.execute(context, source, destination)
            if not output.is_file() or output.stat().st_size == 0:
                raise RuntimeError("Plugin produced no output")
            storage.upload_file(output_key, output)

        updated = job_repository.mark_succeeded(
            job.id,
            artifact_key=output_key,
            filename=f"{Path(job.input_filename).stem}{plugin.manifest.output_suffix}",
            media_type=plugin.manifest.output_media_type,
        )
        if updated is None:
            storage.delete(output_key)
            current = job_repository.get_job(job.id)
            status = current.status if current else "FAILED"
            logger.warning("Discarded output after job status changed id=%s status=%s", job.id, status)
            return {"job_id": job.id, "status": status}
        logger.info("Completed job id=%s tool=%s", job.id, job.tool_name)
        return {"job_id": job.id, "status": updated.status}
    except Exception as error:
        if output_key is not None:
            get_storage().delete(output_key)
        job_repository.mark_failed(job.id, str(error))
        logger.exception("Failed job id=%s tool=%s", job.id, job.tool_name)
        raise
