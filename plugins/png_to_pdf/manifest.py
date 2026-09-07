from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="png-to-pdf",
    version="1.0.0",
    description="Convert a PNG image to PDF",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
