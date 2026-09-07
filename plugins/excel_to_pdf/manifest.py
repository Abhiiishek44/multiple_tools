from plugins.base import PluginManifest

MANIFEST = PluginManifest("excel-to-pdf", "1.0.0", "Convert an Excel workbook to PDF",
    frozenset({".xls", ".xlsx"}), frozenset({"application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), ".pdf", "application/pdf")
