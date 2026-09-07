from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from PIL import Image, ImageOps

    context.report_progress(20)
    with Image.open(source) as image:
        converted = ImageOps.exif_transpose(image).convert("RGB")
        converted.save(destination, "PDF", resolution=150.0)
    context.report_progress(90)
    return destination
