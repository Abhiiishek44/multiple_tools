from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="jpg-to-webp",
    version="1.0.0",
    description="Convert JPEG image to WEBP",
    input_suffixes=frozenset({".jpeg", ".jpg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".webp",
    output_media_type="image/webp",
)
