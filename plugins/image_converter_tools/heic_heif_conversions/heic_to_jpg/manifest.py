from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="heic-to-jpg",
    version="1.0.0",
    description="Convert a HEIC or HEIF image to JPEG",
    input_suffixes=frozenset({".heic", ".heif"}),
    input_media_types=frozenset({
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence",
    }),
    output_suffix=".jpg",
    output_media_type="image/jpeg",
)
