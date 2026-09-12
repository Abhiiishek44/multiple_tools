from pathlib import Path

from PIL import Image, ImageOps, ImageSequence
from pillow_heif import register_heif_opener

from plugins.base import ToolContext


_PIL_FORMATS = {
    ".avif": "AVIF",
    ".bmp": "BMP",
    ".heic": "HEIF",
    ".heif": "HEIF",
    ".jpeg": "JPEG",
    ".jpg": "JPEG",
    ".png": "PNG",
    ".tif": "TIFF",
    ".tiff": "TIFF",
    ".webp": "WEBP",
}


def convert_image(
    context: ToolContext, source: Path, destination: Path
) -> Path:
    """Convert a raster image, deriving the output format from its destination."""
    output_format = _PIL_FORMATS.get(destination.suffix.lower())
    if output_format is None:
        raise ValueError(f"Unsupported image output suffix: {destination.suffix}")
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


def convert_image_to_pdf(
    context: ToolContext, source: Path, destination: Path
) -> Path:
    """Convert all frames of a raster image into PDF pages."""
    if source.suffix.lower() in {".heic", ".heif"}:
        register_heif_opener()

    context.report_progress(20)
    pages: list[Image.Image] = []
    try:
        with Image.open(source) as opened:
            for frame in ImageSequence.Iterator(opened):
                transposed = ImageOps.exif_transpose(frame)
                try:
                    pages.append(_flatten(transposed))
                finally:
                    if transposed is not frame:
                        transposed.close()
        if not pages:
            raise ValueError(
                f"{source.suffix.lstrip('.').upper()} contains no images"
            )

        first, *remaining = pages
        first.save(
            destination,
            "PDF",
            save_all=True,
            append_images=remaining,
            resolution=150.0,
        )
    finally:
        for page in pages:
            page.close()
    context.report_progress(90)
    return destination


def _prepare_image(image: Image.Image, output_format: str) -> Image.Image:
    if output_format in {"BMP", "JPEG"}:
        return _flatten(image)
    return image.copy()


def _flatten(image: Image.Image) -> Image.Image:
    if "A" in image.getbands() or "transparency" in image.info:
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        rgba.close()
        return background
    return image.convert("RGB")


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
