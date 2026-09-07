from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-word",
    version="1.0.0",
    description="Convert a PDF document to DOCX",
    input_suffixes=frozenset({".pdf"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
