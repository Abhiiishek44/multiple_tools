from plugins.base import PluginManifest

MANIFEST = PluginManifest(
    name="excel-to-pdf",
    version="1.0.0",
    description="Convert an Excel workbook to PDF",
    input_suffixes=frozenset({".xls", ".xlsx"}),
    input_media_types=frozenset({
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    output_suffix=".pdf",
    output_media_type="application/pdf",
)
