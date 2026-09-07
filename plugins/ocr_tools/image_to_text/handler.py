import shutil
from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from PIL import Image, ImageOps
    import pytesseract

    if shutil.which("tesseract") is None:
        raise RuntimeError("Tesseract OCR is required and must be on PATH")
    if source.suffix.lower() in {".heic", ".heif"}:
        from pillow_heif import register_heif_opener

        register_heif_opener()
    context.report_progress(20)
    with Image.open(source) as image:
        text = pytesseract.image_to_string(ImageOps.exif_transpose(image))
    destination.write_text(text or "\n", encoding="utf-8")
    context.report_progress(90)
    return destination
