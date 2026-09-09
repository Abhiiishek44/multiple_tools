from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="pdf-to-text",
    version="2.0.0",
    description="Extract text from a PDF with OCR fallback for scanned pages",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".txt",
    output_media_type="text/plain; charset=utf-8",
)
