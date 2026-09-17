import unittest
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import Mock, patch

from infrastructure.queue.celery import create_celery_app
from infrastructure.queue.routing import (
    AI_OCR_QUEUE,
    AI_OCR_TASK,
    CHAT_INGEST_TASK,
    GENERAL_QUEUE,
    GENERAL_TASK,
    queue_for_workload,
    task_for_workload,
)
from packages.jobs import service


class WorkerRoutingTests(unittest.TestCase):
    def test_workloads_route_to_isolated_queues(self) -> None:
        self.assertEqual(queue_for_workload("general"), GENERAL_QUEUE)
        self.assertEqual(queue_for_workload("ai_ocr"), AI_OCR_QUEUE)
        self.assertEqual(task_for_workload("general"), GENERAL_TASK)
        self.assertEqual(task_for_workload("ai_ocr"), AI_OCR_TASK)

    def test_celery_declares_queues_and_routes_background_tasks_general(self) -> None:
        app = create_celery_app()

        self.assertEqual(
            {queue.name for queue in app.conf.task_queues},
            {GENERAL_QUEUE, AI_OCR_QUEUE},
        )
        self.assertEqual(app.conf.task_default_queue, GENERAL_QUEUE)
        self.assertEqual(app.conf.task_routes[GENERAL_TASK]["queue"], GENERAL_QUEUE)
        self.assertEqual(app.conf.task_routes[AI_OCR_TASK]["queue"], AI_OCR_QUEUE)
        self.assertEqual(app.conf.task_routes[CHAT_INGEST_TASK]["queue"], AI_OCR_QUEUE)
        self.assertEqual(
            app.conf.task_routes["storage.cleanup_temporary"]["queue"], GENERAL_QUEUE
        )
        self.assertEqual(
            app.conf.beat_schedule["cleanup-temporary-minio-objects"]["options"]["queue"],
            GENERAL_QUEUE,
        )

    def test_job_submission_dispatches_to_the_workload_queue(self) -> None:
        cases = [
            ("rotate-pdf", "document.pdf", "application/pdf", GENERAL_QUEUE),
            ("image-to-text", "scan.png", "image/png", AI_OCR_QUEUE),
            ("pdf-to-text", "scan.pdf", "application/pdf", AI_OCR_QUEUE),
        ]

        for tool_name, filename, media_type, expected_queue in cases:
            with self.subTest(tool=tool_name):
                storage = Mock()
                job = SimpleNamespace(id="job-id", tool_name=tool_name)
                send_task = Mock()
                with (
                    patch.object(service, "get_storage", return_value=storage),
                    patch.object(service.job_repository, "create_job", return_value=job),
                    patch.object(service.celery_app, "send_task", send_task),
                ):
                    service.submit_job(
                        tool_name=tool_name,
                        filename=filename,
                        media_type=media_type,
                        stream=BytesIO(b"input"),
                        actor=None,
                    )

                self.assertEqual(send_task.call_args.kwargs["queue"], expected_queue)
                expected_workload = "ai_ocr" if expected_queue == AI_OCR_QUEUE else "general"
                self.assertEqual(
                    send_task.call_args.args[0], task_for_workload(expected_workload)
                )


if __name__ == "__main__":
    unittest.main()
