import base64
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from ..exceptions import OcrInputError


def encode_image_data_url(source: Path, *, maximum_pixels: int, maximum_payload_bytes: int) -> str:
    """Validate, normalize, and encode an image as an API-ready data URL."""
    source = Path(source)
    if source.suffix.lower() in {".heic", ".heif"}:
        try:
            from pillow_heif import register_heif_opener
            register_heif_opener()
        except ImportError as error:
            raise OcrInputError("HEIC OCR input requires pillow-heif") from error
    try:
        with Image.open(source) as opened:
            width, height = opened.size
            if width <= 0 or height <= 0 or width * height > maximum_pixels:
                raise OcrInputError(f"OCR image exceeds the {maximum_pixels}-pixel limit")
            oriented = ImageOps.exif_transpose(opened)
            converted = _flatten_to_rgb(oriented)
            try:
                content, media_type = _encode(converted, preserve_jpeg=source.suffix.lower() in {".jpg", ".jpeg"})
            finally:
                converted.close()
                if oriented is not opened:
                    oriented.close()
    except OcrInputError:
        raise
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError) as error:
        raise OcrInputError("OCR input is not a valid supported image") from error
    encoded = base64.b64encode(content)
    if len(encoded) > maximum_payload_bytes:
        raise OcrInputError(f"OCR image payload exceeds the {maximum_payload_bytes}-byte limit")
    return f"data:{media_type};base64,{encoded.decode('ascii')}"


def _flatten_to_rgb(image: Image.Image) -> Image.Image:
    if "A" not in image.getbands() and "transparency" not in image.info:
        return image.convert("RGB")
    rgba = image.convert("RGBA")
    result = Image.new("RGB", rgba.size, "white")
    result.paste(rgba, mask=rgba.getchannel("A"))
    rgba.close()
    return result


def _encode(image: Image.Image, *, preserve_jpeg: bool) -> tuple[bytes, str]:
    with BytesIO() as buffer:
        if preserve_jpeg:
            image.save(buffer, "JPEG", quality=95, optimize=True)
            return buffer.getvalue(), "image/jpeg"
        image.save(buffer, "PNG", optimize=True)
        return buffer.getvalue(), "image/png"
