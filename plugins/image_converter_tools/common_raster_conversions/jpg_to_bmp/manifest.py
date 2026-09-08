from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="jpg-to-bmp",
    version="1.0.0",
    description="Convert JPEG image to BMP",
    input_suffixes=frozenset({".jpeg", ".jpg"}),
    input_media_types=frozenset({"image/jpeg"}),
    output_suffix=".bmp",
    output_media_type="image/bmp",
)
