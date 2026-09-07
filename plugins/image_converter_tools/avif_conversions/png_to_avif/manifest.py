from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="png-to-avif",
    version="1.0.0",
    description="Convert PNG image to AVIF",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".avif",
    output_media_type="image/avif",
)
