from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="word-to-html",
    version="1.0.0",
    description="Convert a Word document to HTML",
    input_suffixes=frozenset({".doc", ".docx"}),
    input_media_types=frozenset({
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    output_suffix=".html",
    output_media_type="text/html; charset=utf-8",
)
