from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="text-to-pdf",
    version="1.0.0",
    description="Convert a plain-text document to PDF",
    input_suffixes=frozenset({".txt"}),
    input_media_types=frozenset({"text/plain"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
