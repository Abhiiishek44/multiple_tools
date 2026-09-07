from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="png-to-bmp",
    version="1.0.0",
    description="Convert PNG image to BMP",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".bmp",
    output_media_type="image/bmp",
)
