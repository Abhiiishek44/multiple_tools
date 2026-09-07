from plugins.base import PluginManifest

MANIFEST = PluginManifest("pdf-to-jpg", "1.0.0", "Convert PDF pages to a ZIP of JPEG images",
    frozenset({".pdf"}), frozenset({"application/pdf"}), ".zip", "application/zip")
