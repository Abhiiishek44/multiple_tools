from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="word-to-text",
    version="1.0.0",
    description="Extract text from a DOCX document",
    input_suffixes=frozenset({".docx"}),
    input_media_types=frozenset({
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }),
    output_suffix=".txt",
    output_media_type="text/plain; charset=utf-8",
)
