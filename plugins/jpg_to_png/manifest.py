from plugins.base import PluginManifest

MANIFEST = PluginManifest("jpg-to-png", "1.0.0", "Convert a JPEG image to PNG",
    frozenset({".jpg", ".jpeg"}), frozenset({"image/jpeg"}), ".png", "image/png")
