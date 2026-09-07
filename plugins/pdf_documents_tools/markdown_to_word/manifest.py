from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="markdown-to-word",
    version="1.0.0",
    description="Convert Markdown to DOCX",
    input_suffixes=frozenset({".markdown", ".md"}),
    input_media_types=frozenset({"text/markdown", "text/plain", "text/x-markdown"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
