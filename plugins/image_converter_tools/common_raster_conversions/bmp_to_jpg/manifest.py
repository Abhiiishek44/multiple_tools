from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="bmp-to-jpg",
    version="1.0.0",
    description="Convert BMP image to JPEG",
    input_suffixes=frozenset({".bmp"}),
    input_media_types=frozenset({"image/bmp", "image/x-ms-bmp"}),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
