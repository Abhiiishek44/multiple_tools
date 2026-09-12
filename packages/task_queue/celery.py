from celery import Celery

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
        task_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        beat_schedule={
            "cleanup-temporary-minio-objects": {
                "task": "storage.cleanup_temporary",
                "schedule": settings.minio_cleanup_interval_minutes * 60,
            }
        },
    )
    app.loader.import_default_modules()
    return app


celery_app = create_celery_app()
