from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="html-to-word",
    version="1.0.0",
    description="Convert an HTML document to DOCX",
    input_suffixes=frozenset({".htm", ".html"}),
    input_media_types=frozenset({"application/xhtml+xml", "text/html"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
