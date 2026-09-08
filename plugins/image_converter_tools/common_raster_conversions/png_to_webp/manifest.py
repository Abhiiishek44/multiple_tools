from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="png-to-webp",
    version="1.0.0",
    description="Convert PNG image to WEBP",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".webp",
    output_media_type="image/webp",
)
