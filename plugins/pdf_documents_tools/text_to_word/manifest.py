from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="text-to-word",
    version="1.0.0",
    description="Convert plain text to DOCX",
    input_suffixes=frozenset({".txt"}),
    input_media_types=frozenset({"text/plain"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
