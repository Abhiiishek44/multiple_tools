from plugins.base import PluginManifest

MANIFEST = PluginManifest("pdf-to-png", "1.0.0", "Convert PDF pages to a ZIP of PNG images",
    frozenset({".pdf"}), frozenset({"application/pdf"}), ".zip", "application/zip")
