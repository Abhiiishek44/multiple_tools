from pathlib import Path

from packages.ocr import extract_text
from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    result = extract_text(source, job_id=context.job_id)
    destination.write_text(f"{result.text}\n", encoding="utf-8")
    context.report_progress(90)
    return destination
