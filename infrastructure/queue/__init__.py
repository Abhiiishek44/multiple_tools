"""Celery task-queue adapter."""

from infrastructure.queue.celery import celery_app

__all__ = ["celery_app"]

