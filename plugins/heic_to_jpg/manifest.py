from plugins.base import PluginManifest

MANIFEST = PluginManifest("heic-to-jpg", "1.0.0", "Convert a HEIC or HEIF image to JPEG",
    frozenset({".heic", ".heif"}), frozenset({"image/heic", "image/heif",
    "image/heic-sequence", "image/heif-sequence"}), ".jpg", "image/jpeg")
