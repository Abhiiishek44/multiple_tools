from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(10)
    sections: list[str] = []
    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        for index, page in enumerate(document):
            sections.append(
                f'<section class="pdf-page" data-page="{index + 1}">'
                f'{page.get_text("html")}</section>'
            )
            context.report_progress(10 + int(75 * (index + 1) / document.page_count))
    destination.write_text(
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<style>.pdf-page{position:relative;margin:1rem auto;}</style></head><body>"
        + "\n".join(sections)
        + "</body></html>",
        encoding="utf-8",
    )
    context.report_progress(90)
    return destination
