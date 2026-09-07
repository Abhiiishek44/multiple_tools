from plugins.base import PluginManifest

MANIFEST = PluginManifest("png-to-pdf", "1.0.0", "Convert a PNG image to PDF",
    frozenset({".png"}), frozenset({"image/png"}), ".pdf", "application/pdf")
