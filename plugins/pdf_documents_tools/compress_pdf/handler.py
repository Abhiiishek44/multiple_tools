from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        document.save(destination, garbage=4, clean=True, deflate=True)
    context.report_progress(90)
    return destination
