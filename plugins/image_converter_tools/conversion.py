from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

from plugins.base import ToolContext


def convert_image(
    context: ToolContext,
    source: Path,
    destination: Path,
    *,
    output_format: str,
) -> Path:
    if source.suffix.lower() in {".heic", ".heif"} or output_format == "HEIF":
        register_heif_opener()

    context.report_progress(20)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        converted = _prepare_image(image, output_format)
        try:
            converted.save(destination, output_format, **_save_options(output_format))
        finally:
            if converted is not image:
                converted.close()
            if image is not opened:
                image.close()
    context.report_progress(90)
    return destination


def _prepare_image(image: Image.Image, output_format: str) -> Image.Image:
    if output_format in {"BMP", "JPEG"}:
        if "A" in image.getbands() or "transparency" in image.info:
            rgba = image.convert("RGBA")
            background = Image.new("RGB", rgba.size, "white")
            background.paste(rgba, mask=rgba.getchannel("A"))
            rgba.close()
            return background
        return image.convert("RGB")
    return image.copy()


def _save_options(output_format: str) -> dict[str, object]:
    if output_format == "JPEG":
        return {"quality": 90, "optimize": True}
    if output_format == "PNG":
        return {"optimize": True}
    if output_format == "WEBP":
        return {"quality": 85, "method": 6}
    if output_format == "HEIF":
        return {"quality": 90}
    if output_format == "AVIF":
        return {"quality": 85}
    if output_format == "TIFF":
        return {"compression": "tiff_deflate"}
    return {}
