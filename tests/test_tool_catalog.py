import unittest

from plugins.catalog import build_tool_catalog
from scripts.generate_tool_catalog import manifests


class ToolCatalogTests(unittest.TestCase):
    def test_every_manifest_produces_complete_unique_metadata(self) -> None:
        registered = manifests()
        catalog = build_tool_catalog(registered)
        slugs = {str(tool["slug"]) for tool in catalog}

        self.assertEqual(len(catalog), len(registered))
        self.assertEqual(len(slugs), len(catalog))
        for tool in catalog:
            self.assertEqual(tool["name"], tool["slug"])
            self.assertTrue(tool["title"])
            self.assertTrue(tool["description"])
            self.assertTrue(tool["category"])
            self.assertTrue(tool["input_formats"])
            self.assertTrue(tool["output_formats"])
            self.assertTrue(tool["features"])
            self.assertTrue(tool["faq"])
            self.assertTrue(tool["how_it_works"])
            self.assertNotIn(tool["slug"], tool["related_tools"])
            self.assertTrue(set(tool["related_tools"]).issubset(slugs))

    def test_declared_options_are_exported_from_manifests(self) -> None:
        catalog = {tool["slug"]: tool for tool in build_tool_catalog(manifests())}

        self.assertEqual([option["name"] for option in catalog["rotate-pdf"]["options"]], ["angle"])
        self.assertEqual(
            [option["name"] for option in catalog["protect-pdf"]["options"]],
            ["password", "owner_password"],
        )


if __name__ == "__main__":
    unittest.main()
