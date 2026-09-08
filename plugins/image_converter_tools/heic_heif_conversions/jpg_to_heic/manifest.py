from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="jpg-to-heic",
    version="1.0.0",
    description="Convert JPEG image to HEIC/HEIF",
    input_suffixes=frozenset({".jpeg", ".jpg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".heic",
    output_media_type="image/heic",
)
