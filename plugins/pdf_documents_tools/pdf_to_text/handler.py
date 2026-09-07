from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(10)
    pages: list[str] = []
    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        for index, page in enumerate(document):
            pages.append(page.get_text("text", sort=True).rstrip())
            context.report_progress(10 + int(75 * (index + 1) / document.page_count))
    destination.write_text("\n\n\f\n\n".join(pages) + "\n", encoding="utf-8")
    context.report_progress(90)
    return destination
