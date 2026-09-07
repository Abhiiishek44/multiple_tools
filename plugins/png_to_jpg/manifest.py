from plugins.base import PluginManifest

MANIFEST = PluginManifest("png-to-jpg", "1.0.0", "Convert a PNG image to JPEG",
    frozenset({".png"}), frozenset({"image/png"}), ".jpg", "image/jpeg")
