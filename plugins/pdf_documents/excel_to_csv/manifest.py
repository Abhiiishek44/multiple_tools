from plugins.base import PluginManifest


MANIFEST = PluginManifest(
    name="excel-to-csv",
    version="1.0.0",
    description="Convert the active XLSX worksheet to CSV",
    input_suffixes=frozenset({".xlsx"}),
    input_media_types=frozenset({
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    output_suffix=".csv",
    output_media_type="text/csv; charset=utf-8",
)
