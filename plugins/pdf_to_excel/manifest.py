from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="pdf-to-excel",
    version="1.0.0",
    description="Extract PDF tables and text into XLSX",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".xlsx",
    output_media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)
