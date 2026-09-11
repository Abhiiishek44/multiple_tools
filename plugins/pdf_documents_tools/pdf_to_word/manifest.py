from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-word",
    version="1.1.0",
    description=(
        "Convert a PDF document to a layout-preserving DOCX; pass "
        "mode=editable to reconstruct editable content"
    ),
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
