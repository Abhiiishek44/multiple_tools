from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="pdf-to-jpg",
    version="1.0.0",
    description="Convert PDF pages to a ZIP of JPEG images",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".zip",
    output_media_type="application/zip",
)
