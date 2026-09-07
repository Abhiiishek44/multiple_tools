from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-html",
    version="1.0.0",
    description="Convert PDF pages to HTML",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".html",
    output_media_type="text/html; charset=utf-8",
)
