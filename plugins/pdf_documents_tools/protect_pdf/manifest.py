from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="protect-pdf",
    version="1.0.0",
    description="Protect a PDF with a password",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
