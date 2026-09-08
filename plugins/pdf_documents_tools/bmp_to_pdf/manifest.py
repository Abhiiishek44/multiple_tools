from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="bmp-to-pdf",
    version="1.0.0",
    description="Convert a BMP image to PDF",
    input_suffixes=frozenset({".bmp"}),
    input_media_types=frozenset({"image/bmp", "image/x-ms-bmp"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
