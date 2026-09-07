from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="pdf-to-powerpoint",
    version="1.0.0",
    description="Convert PDF pages into PowerPoint slides",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pptx",
    output_media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
)
