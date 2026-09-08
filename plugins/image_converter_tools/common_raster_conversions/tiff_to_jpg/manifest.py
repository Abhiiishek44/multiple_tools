from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="tiff-to-jpg",
    version="1.0.0",
    description="Convert TIFF image to JPEG",
    input_suffixes=frozenset({".tif", ".tiff"}),
    input_media_types=frozenset({"image/tiff"}),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
