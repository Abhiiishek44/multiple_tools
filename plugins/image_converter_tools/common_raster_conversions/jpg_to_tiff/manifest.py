from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="jpg-to-tiff",
    version="1.0.0",
    description="Convert JPEG image to TIFF",
    input_suffixes=frozenset({".jpeg", ".jpg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".tiff",
    output_media_type="image/tiff",
)
