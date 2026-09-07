from plugins.base import PluginManifest

MANIFEST = PluginManifest("image-to-text", "1.0.0", "Extract text from an image using OCR",
    frozenset({".bmp", ".heic", ".heif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"}),
    frozenset({"image/bmp", "image/heic", "image/heif", "image/jpeg", "image/png", "image/tiff", "image/webp"}),
    ".txt", "text/plain; charset=utf-8")
