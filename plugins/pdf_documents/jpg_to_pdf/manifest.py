from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="jpg-to-pdf",
    version="1.0.0",
    description="Convert a JPEG image to PDF",
    input_suffixes=frozenset({".jpg", ".jpeg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
