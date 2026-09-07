from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="avif-to-jpg",
    version="1.0.0",
    description="Convert AVIF image to JPEG",
    input_suffixes=frozenset({".avif"}),
    input_media_types=frozenset({"image/avif", "image/avif-sequence"}),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
