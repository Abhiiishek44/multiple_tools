from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from PIL import Image, ImageOps
    from pillow_heif import register_heif_opener

    register_heif_opener()
    context.report_progress(20)
    with Image.open(source) as image:
        ImageOps.exif_transpose(image).convert("RGB").save(
            destination, "JPEG", quality=90, optimize=True
        )
    context.report_progress(90)
    return destination
