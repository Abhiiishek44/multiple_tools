from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="png-to-heic",
    version="1.0.0",
    description="Convert PNG image to HEIC/HEIF",
    input_suffixes=frozenset({".png"}),
    input_media_types=frozenset({"image/png"}),
    output_suffix=".heic",
    output_media_type="image/heic",
)
