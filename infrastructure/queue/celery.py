from celery import Celery
from kombu import Queue

from infrastructure.queue.routing import (
    AI_OCR_QUEUE,
    AI_OCR_TASK,
    CHAT_INGEST_TASK,
    GENERAL_QUEUE,
    GENERAL_TASK,
)
from packages.core.config import get_settings


def create_celery_app() -> Celery:
    settings = get_settings()
    app = Celery(
        "multiple_tools",
        broker=settings.celery_broker_url,
        include=["apps.worker.tasks"],
    )
    app.conf.update(
        broker_connection_retry_on_startup=True,
        task_ignore_result=True,
        worker_prefetch_multiplier=1,
        task_default_queue=GENERAL_QUEUE,
        task_queues=(Queue(GENERAL_QUEUE), Queue(AI_OCR_QUEUE)),
        task_routes={
            GENERAL_TASK: {"queue": GENERAL_QUEUE},
            AI_OCR_TASK: {"queue": AI_OCR_QUEUE},
            CHAT_INGEST_TASK: {"queue": AI_OCR_QUEUE},
            "storage.cleanup_temporary": {"queue": GENERAL_QUEUE},
        },
        task_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        beat_schedule={
            "cleanup-temporary-minio-objects": {
                "task": "storage.cleanup_temporary",
                "schedule": settings.minio_cleanup_interval_minutes * 60,
                "options": {"queue": GENERAL_QUEUE},
            }
        },
    )
    app.loader.import_default_modules()
    return app


celery_app = create_celery_app()
