from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="tiff-to-png",
    version="1.0.0",
    description="Convert TIFF image to PNG",
    input_suffixes=frozenset({".tif", ".tiff"}),
    input_media_types=frozenset({"image/tiff"}),
    output_suffix=".png",
    output_media_type="image/png",
)
