from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="unlock-pdf",
    version="1.0.0",
    description="Remove password protection from a PDF",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
