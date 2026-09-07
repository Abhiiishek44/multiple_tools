from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    angle = context.options.get("angle", 90)
    if isinstance(angle, bool) or not isinstance(angle, int):
        raise ValueError("Option 'angle' must be an integer")
    if angle not in {-270, -180, -90, 90, 180, 270}:
        raise ValueError("Option 'angle' must be 90, 180, 270, -90, -180, or -270")

    context.report_progress(10)
    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        for index, page in enumerate(document):
            page.set_rotation((page.rotation + angle) % 360)
            context.report_progress(10 + int(75 * (index + 1) / document.page_count))
        document.save(destination, garbage=4, deflate=True)
    context.report_progress(90)
    return destination
