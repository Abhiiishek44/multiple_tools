from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="heic-to-png",
    version="1.0.0",
    description="Convert HEIC/HEIF image to PNG",
    input_suffixes=frozenset({".heic", ".heif"}),
    input_media_types=frozenset({"image/heic", "image/heic-sequence", "image/heif", "image/heif-sequence"}),
    output_suffix=".png",
    output_media_type="image/png",
)
