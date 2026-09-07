from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="html-to-pdf",
    version="1.0.0",
    description="Convert an HTML document to PDF",
    input_suffixes=frozenset({".htm", ".html"}),
    input_media_types=frozenset({"application/xhtml+xml", "text/html"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
