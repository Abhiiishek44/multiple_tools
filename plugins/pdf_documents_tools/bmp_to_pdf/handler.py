from pathlib import Path

from PIL import Image

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    with Image.open(source) as image:
        image.convert("RGB").save(destination, "PDF", resolution=150)
    context.report_progress(90)
    return destination
