from typing import Literal

GENERAL_QUEUE = "general"
AI_OCR_QUEUE = "ai_ocr"
GENERAL_TASK = "tools.execute.general"
AI_OCR_TASK = "tools.execute.ai_ocr"
CHAT_INGEST_TASK = "chat.ingest_document"


def queue_for_workload(workload: Literal["general", "ai_ocr"]) -> str:
    return AI_OCR_QUEUE if workload == "ai_ocr" else GENERAL_QUEUE


def task_for_workload(workload: Literal["general", "ai_ocr"]) -> str:
    return AI_OCR_TASK if workload == "ai_ocr" else GENERAL_TASK
