from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-text",
    version="1.0.0",
    description="Extract text from a PDF",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".txt",
    output_media_type="text/plain; charset=utf-8",
)
