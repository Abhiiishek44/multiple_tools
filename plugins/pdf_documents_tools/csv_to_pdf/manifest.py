from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="csv-to-pdf",
    version="1.0.0",
    description="Convert CSV data to PDF",
    input_suffixes=frozenset({".csv"}),
    input_media_types=frozenset({"application/csv", "text/csv"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
