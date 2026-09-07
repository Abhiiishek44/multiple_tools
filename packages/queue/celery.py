from celery import Celery

from packages.core.config import get_settings


def create_celery_app() -> Celery:
    settings = get_settings()
    app = Celery(
        "multiple_tools",
        broker=settings.celery_broker_url,
        backend=settings.celery_result_backend,
        include=["apps.worker.tasks"],
    )
    app.conf.update(
        broker_connection_retry_on_startup=True,
        result_expires=3600,
        task_track_started=True,
        worker_prefetch_multiplier=1,
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
    )
    app.loader.import_default_modules()
    return app


celery_app = create_celery_app()
