from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="markdown-to-pdf",
    version="1.0.0",
    description="Convert Markdown to PDF",
    input_suffixes=frozenset({".markdown", ".md"}),
    input_media_types=frozenset({"text/markdown", "text/plain", "text/x-markdown"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
