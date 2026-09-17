import unittest

from plugins.catalog import build_tool_catalog
from plugins.registry import get_plugin, list_plugins, plugin_registry


class PluginRegistryTests(unittest.TestCase):
    def test_registry_is_keyed_only_by_plugin_name(self) -> None:
        plugins = plugin_registry()

        self.assertIs(plugins["image-to-text"], get_plugin("image-to-text"))
        self.assertTrue(all(name == plugin.manifest.name for name, plugin in plugins.items()))
        self.assertTrue(all(not hasattr(plugin.manifest, "version") for plugin in plugins.values()))

    def test_catalog_does_not_publish_plugin_versions(self) -> None:
        catalog = build_tool_catalog(plugin.manifest for plugin in list_plugins())

        self.assertTrue(catalog)
        self.assertTrue(all("version" not in tool for tool in catalog))

    def test_only_ocr_plugins_use_the_ai_ocr_workload(self) -> None:
        workloads = {plugin.manifest.name: plugin.manifest.workload for plugin in list_plugins()}

        self.assertEqual(
            {name for name, workload in workloads.items() if workload == "ai_ocr"},
            {"image-to-text", "pdf-to-text"},
        )
        self.assertTrue(
            all(
                workload == "general"
                for name, workload in workloads.items()
                if name not in {"image-to-text", "pdf-to-text"}
            )
        )


if __name__ == "__main__":
    unittest.main()
