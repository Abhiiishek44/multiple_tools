from plugins.base import PluginManifest

MANIFEST = PluginManifest("compress-pdf", "1.0.0", "Optimize and compress a PDF",
    frozenset({".pdf"}), frozenset({"application/pdf"}), ".pdf", "application/pdf")
