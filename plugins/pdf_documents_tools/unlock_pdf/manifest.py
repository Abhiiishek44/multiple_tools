from plugins.base import PluginManifest, PluginOption

MANIFEST = PluginManifest(
    name="unlock-pdf",
    description="Remove password protection from a PDF",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
    options=(
        PluginOption(
            name="password",
            label="Current PDF password",
            type="password",
            required=True,
        ),
    ),
)
