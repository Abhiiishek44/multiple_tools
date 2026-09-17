from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="csv-to-excel",
    description="Convert CSV data to XLSX",
    input_suffixes=frozenset({".csv"}),
    input_media_types=frozenset({"application/csv", "text/csv"}),
    output_suffix=".xlsx",
    output_media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)
