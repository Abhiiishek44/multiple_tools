"""Background task queue configuration."""

from packages.task_queue.celery import celery_app

__all__ = ["celery_app"]
