from pathlib import Path

from docx import Document

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    document = Document()
    for line in source.read_text(encoding="utf-8-sig").splitlines():
        document.add_paragraph(line)
    document.save(destination)
    context.report_progress(90)
    return destination
