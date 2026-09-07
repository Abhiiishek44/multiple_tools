from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="tiff-to-pdf",
    version="1.0.0",
    description="Convert a TIFF image to PDF",
    input_suffixes=frozenset({".tif", ".tiff"}),
    input_media_types=frozenset({"image/tiff"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
