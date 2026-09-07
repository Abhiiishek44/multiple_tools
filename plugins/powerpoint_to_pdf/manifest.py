from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="powerpoint-to-pdf",
    version="1.0.0",
    description="Convert a PowerPoint presentation to PDF",
    input_suffixes=frozenset({".ppt", ".pptx"}),
    input_media_types=frozenset({
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
