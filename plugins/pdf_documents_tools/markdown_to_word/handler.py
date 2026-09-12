from pathlib import Path

import markdown

from plugins.base import ToolContext
from plugins.shared.libreoffice import convert_with_libreoffice


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    body = markdown.markdown(
        source.read_text(encoding="utf-8-sig"), extensions=["extra", "sane_lists"]
    )
    intermediate = destination.parent / f"{source.stem}.html"
    intermediate.write_text(
        "<!doctype html><html><head><meta charset='utf-8'></head>"
        f"<body>{body}</body></html>",
        encoding="utf-8",
    )
    context.report_progress(35)
    return convert_with_libreoffice(
        context, intermediate, destination, start_progress=None
    )
