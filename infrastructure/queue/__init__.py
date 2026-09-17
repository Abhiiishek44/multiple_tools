"""Celery task-queue adapter."""

from infrastructure.queue.celery import celery_app
from infrastructure.queue.routing import (
    AI_OCR_QUEUE,
    AI_OCR_TASK,
    CHAT_INGEST_TASK,
    GENERAL_QUEUE,
    GENERAL_TASK,
    queue_for_workload,
    task_for_workload,
)

__all__ = [
    "AI_OCR_QUEUE",
    "AI_OCR_TASK",
    "CHAT_INGEST_TASK",
    "GENERAL_QUEUE",
    "GENERAL_TASK",
    "celery_app",
    "queue_for_workload",
    "task_for_workload",
]
