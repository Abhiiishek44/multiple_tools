from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-word",
    version="1.2.0",
    description=(
        "Convert a PDF document to an editable DOCX; pass "
        "mode=preserve-layout to render each page as an image"
    ),
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)
