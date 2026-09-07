from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="compress-pdf",
    version="1.0.0",
    description="Optimize and compress a PDF",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
