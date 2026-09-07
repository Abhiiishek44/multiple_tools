from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="word-to-pdf",
    version="1.0.0",
    description="Convert a DOC or DOCX document to PDF",
    input_suffixes=frozenset({".doc", ".docx"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
