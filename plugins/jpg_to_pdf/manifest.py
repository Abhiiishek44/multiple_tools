from plugins.base import PluginManifest

MANIFEST = PluginManifest("jpg-to-pdf", "1.0.0", "Convert a JPEG image to PDF",
    frozenset({".jpg", ".jpeg"}), frozenset({"image/jpeg"}), ".pdf", "application/pdf")
