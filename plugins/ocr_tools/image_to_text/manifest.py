from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="image-to-text",
    version="1.0.0",
    description="Extract text from an image using OCR",
    input_suffixes=frozenset({
        ".bmp", ".heic", ".heif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp",
    }),
    input_media_types=frozenset({
        "image/bmp", "image/heic", "image/heif", "image/jpeg", "image/png", "image/tiff", "image/webp",
    }),
    output_suffix=".txt",
    output_media_type="text/plain; charset=utf-8",
)
