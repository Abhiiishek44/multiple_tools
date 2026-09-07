from pathlib import Path

from PIL import Image, ImageSequence

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(20)
    with Image.open(source) as image:
        pages = [frame.copy().convert("RGB") for frame in ImageSequence.Iterator(image)]
    if not pages:
        raise ValueError("WEBP contains no images")
    first, *remaining = pages
    first.save(destination, "PDF", save_all=True, append_images=remaining, resolution=150)
    for page in pages:
        page.close()
    context.report_progress(90)
    return destination
