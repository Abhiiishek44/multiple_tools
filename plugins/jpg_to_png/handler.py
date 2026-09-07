from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from PIL import Image, ImageOps

    context.report_progress(20)
    with Image.open(source) as image:
        ImageOps.exif_transpose(image).save(destination, "PNG", optimize=True)
    context.report_progress(90)
    return destination
