from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="webp-to-avif",
    version="1.0.0",
    description="Convert WEBP image to AVIF",
    input_suffixes=frozenset({".webp"}),
    input_media_types=frozenset({"image/webp"}),
    output_suffix=".avif",
    output_media_type="image/avif",
)
