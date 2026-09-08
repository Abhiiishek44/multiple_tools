from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="jpg-to-png",
    version="1.0.0",
    description="Convert a JPEG image to PNG",
    input_suffixes=frozenset({".jpg", ".jpeg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".png",
    output_media_type="image/png",
)
