from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="avif-to-png",
    version="1.0.0",
    description="Convert AVIF image to PNG",
    input_suffixes=frozenset({".avif"}),
    input_media_types=frozenset({"image/avif", "image/avif-sequence"}),
    output_suffix=".png",
    output_media_type="image/png",
)
