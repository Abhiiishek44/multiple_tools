from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="webp-to-png",
    version="1.0.0",
    description="Convert WEBP image to PNG",
    input_suffixes=frozenset({".webp"}),
    input_media_types=frozenset({"image/webp"}),
    output_suffix=".png",
    output_media_type="image/png",
)
