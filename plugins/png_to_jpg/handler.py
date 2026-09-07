from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from PIL import Image

    context.report_progress(20)
    with Image.open(source) as image:
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        background.save(destination, "JPEG", quality=90, optimize=True)
    context.report_progress(90)
    return destination
