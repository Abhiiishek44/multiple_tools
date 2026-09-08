from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="jpg-to-avif",
    version="1.0.0",
    description="Convert JPEG image to AVIF",
    input_suffixes=frozenset({".jpeg", ".jpg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".avif",
    output_media_type="image/avif",
)
