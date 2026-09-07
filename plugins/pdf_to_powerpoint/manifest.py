from plugins.base import PluginManifest

MANIFEST = PluginManifest("pdf-to-powerpoint", "1.0.0", "Convert PDF pages into PowerPoint slides",
    frozenset({".pdf"}), frozenset({"application/pdf"}), ".pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation")
