from plugins.base import PluginManifest

MANIFEST = PluginManifest("powerpoint-to-pdf", "1.0.0", "Convert a PowerPoint presentation to PDF",
    frozenset({".ppt", ".pptx"}), frozenset({"application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"}), ".pdf", "application/pdf")
