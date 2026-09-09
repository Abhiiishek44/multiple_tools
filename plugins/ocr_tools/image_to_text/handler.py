from pathlib import Path

from packages.documents.ocr import extract_text
from packages.documents.text import TextNormalizer
from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    result = extract_text(source, job_id=context.job_id)
    text = TextNormalizer().normalize(result.text)
    destination.write_text(f"{text}\n" if text else "", encoding="utf-8")
    context.report_progress(90)
    return destination
