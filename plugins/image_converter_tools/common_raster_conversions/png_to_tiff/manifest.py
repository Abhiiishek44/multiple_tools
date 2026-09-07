from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="png-to-tiff",
    version="1.0.0",
    description="Convert PNG image to TIFF",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".tiff",
    output_media_type="image/tiff",
)
