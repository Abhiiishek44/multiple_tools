from dataclasses import dataclass

from plugins.base import PluginManifest


@dataclass(frozen=True, slots=True)
class ImageFormat:
    label: str
    suffixes: frozenset[str]
    media_types: frozenset[str]
    output_suffix: str
    output_media_type: str


IMAGE_FORMATS = {
    "avif": ImageFormat(
        "AVIF",
        frozenset({".avif"}),
        frozenset({"image/avif", "image/avif-sequence"}),
        ".avif",
        "image/avif",
    ),
    "bmp": ImageFormat(
        "BMP",
        frozenset({".bmp"}),
        frozenset({"image/bmp", "image/x-ms-bmp"}),
        ".bmp",
        "image/bmp",
    ),
    "heic": ImageFormat(
        "HEIC/HEIF",
        frozenset({".heic", ".heif"}),
        frozenset(
            {"image/heic", "image/heic-sequence", "image/heif", "image/heif-sequence"}
        ),
        ".heic",
        "image/heic",
    ),
    "jpg": ImageFormat(
        "JPEG",
        frozenset({".jpeg", ".jpg"}),
        frozenset({"image/jpeg"}),
        ".jpg",
        "image/jpeg",
    ),
    "png": ImageFormat(
        "PNG",
        frozenset({".png"}),
        frozenset({"image/png"}),
        ".png",
        "image/png",
    ),
    "tiff": ImageFormat(
        "TIFF",
        frozenset({".tif", ".tiff"}),
        frozenset({"image/tiff"}),
        ".tiff",
        "image/tiff",
    ),
    "webp": ImageFormat(
        "WEBP",
        frozenset({".webp"}),
        frozenset({"image/webp"}),
        ".webp",
        "image/webp",
    ),
}


def image_conversion(
    source_name: str,
    target_name: str,
    *,
    description: str | None = None,
) -> PluginManifest:
    """Build a raster conversion definition from canonical format metadata."""
    source = IMAGE_FORMATS[source_name]
    target = IMAGE_FORMATS[target_name]
    return PluginManifest(
        name=f"{source_name}-to-{target_name}",
        version="1.0.0",
        description=description or f"Convert {source.label} image to {target.label}",
        input_suffixes=source.suffixes,
        input_media_types=source.media_types,
        output_suffix=target.output_suffix,
        output_media_type=target.output_media_type,
    )


def image_to_pdf(source_name: str) -> PluginManifest:
    source = IMAGE_FORMATS[source_name]
    return PluginManifest(
        name=f"{source_name}-to-pdf",
        version="1.0.0",
        description=f"Convert a {source.label} image to PDF",
        input_suffixes=source.suffixes,
        input_media_types=source.media_types,
        output_suffix=".pdf",
        output_media_type="application/pdf",
    )
