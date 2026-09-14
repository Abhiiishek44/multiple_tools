from plugins.base import PluginManifest, PluginOption

MANIFEST = PluginManifest(
    name="protect-pdf",
    version="1.0.0",
    description="Protect a PDF with a password",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
    options=(
        PluginOption(
            name="password",
            label="New PDF password",
            type="password",
            required=True,
        ),
        PluginOption(
            name="owner_password",
            label="Owner password",
            type="password",
            description="Optional; defaults to the PDF password.",
        ),
    ),
)
