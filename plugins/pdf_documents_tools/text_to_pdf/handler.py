from pathlib import Path

from docx import Document

from plugins.base import ToolContext
from plugins.shared.libreoffice import convert_with_libreoffice


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(10)
    document = Document()
    for line in source.read_text(encoding="utf-8-sig").splitlines():
        document.add_paragraph(line)
    intermediate = destination.parent / f"{source.stem}.docx"
    document.save(intermediate)
    context.report_progress(40)
    return convert_with_libreoffice(
        context, intermediate, destination, start_progress=None
    )
