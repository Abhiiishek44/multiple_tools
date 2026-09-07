from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="avif-to-webp",
    version="1.0.0",
    description="Convert AVIF image to WEBP",
    input_suffixes=frozenset({".avif"}),
    input_media_types=frozenset({"image/avif", "image/avif-sequence"}),
    output_suffix=".webp",
    output_media_type="image/webp",
)
