from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="webp-to-pdf",
    version="1.0.0",
    description="Convert a WEBP image to PDF",
    input_suffixes=frozenset({".webp"}),
    input_media_types=frozenset({"image/webp"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
