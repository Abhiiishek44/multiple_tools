from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="png-to-jpg",
    version="1.0.0",
    description="Convert a PNG image to JPEG",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
