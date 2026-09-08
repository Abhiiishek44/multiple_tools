from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="webp-to-jpg",
    version="1.0.0",
    description="Convert WEBP image to JPEG",
    input_suffixes=frozenset({".webp"}),
    input_media_types=frozenset({"image/webp"}),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
