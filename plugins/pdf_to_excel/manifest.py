from plugins.base import PluginManifest

MANIFEST = PluginManifest("pdf-to-excel", "1.0.0", "Extract PDF tables and text into XLSX",
    frozenset({".pdf"}), frozenset({"application/pdf"}), ".xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
