import tempfile
import unittest
from pathlib import Path

import pymupdf

from apps.api.services.job_service import _parse_options
from packages.core.exceptions import ValidationError
from plugins.base import ToolContext
from plugins.registry import get_plugin, plugin_registry


NEW_TOOL_NAMES = {
    "bmp-to-pdf",
    "csv-to-excel",
    "csv-to-pdf",
    "excel-to-csv",
    "html-to-pdf",
    "html-to-word",
    "markdown-to-pdf",
    "markdown-to-word",
    "pdf-to-html",
    "pdf-to-text",
    "protect-pdf",
    "rotate-pdf",
    "text-to-pdf",
    "text-to-word",
    "tiff-to-pdf",
    "unlock-pdf",
    "webp-to-pdf",
    "word-to-html",
    "word-to-text",
}


class NewPluginTests(unittest.TestCase):
    def test_all_new_plugins_are_discovered(self) -> None:
        self.assertTrue(NEW_TOOL_NAMES.issubset(plugin_registry()))
        self.assertEqual(len(plugin_registry()), 34)

    def test_document_plugins_are_grouped(self) -> None:
        plugins_directory = Path(__file__).parents[1] / "plugins"
        document_directory = plugins_directory / "pdf_documents"
        self.assertTrue((document_directory / "rotate_pdf" / "manifest.py").is_file())
        self.assertTrue((document_directory / "word_to_text" / "handler.py").is_file())
        self.assertTrue((plugins_directory / "jpg_to_png" / "manifest.py").is_file())

    def test_options_must_be_a_json_object(self) -> None:
        self.assertEqual(_parse_options('{"angle": 90}'), {"angle": 90})
        with self.assertRaisesRegex(ValidationError, "JSON object"):
            _parse_options("[]")

    def test_rotate_protect_and_unlock_pdf(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "source.pdf"
            rotated = root / "rotated.pdf"
            protected = root / "protected.pdf"
            unlocked = root / "unlocked.pdf"

            document = pymupdf.open()
            document.new_page().insert_text((72, 72), "test")
            document.save(source)
            document.close()

            get_plugin("rotate-pdf").execute(self._context(angle=90), source, rotated)
            with pymupdf.open(rotated) as result:
                self.assertEqual(result[0].rotation, 90)

            get_plugin("protect-pdf").execute(
                self._context(password="secret"), source, protected
            )
            with pymupdf.open(protected) as result:
                self.assertTrue(result.needs_pass)

            get_plugin("unlock-pdf").execute(
                self._context(password="secret"), protected, unlocked
            )
            with pymupdf.open(unlocked) as result:
                self.assertFalse(result.needs_pass)

    @staticmethod
    def _context(**options: object) -> ToolContext:
        return ToolContext(
            job_id="test",
            report_progress=lambda value: None,
            options=options,
        )
