import logging
import tempfile
from collections.abc import Callable
from pathlib import Path

import pymupdf

from packages.documents.ocr import extract_text
from packages.documents.pdf.detector import has_usable_native_text
from packages.documents.pdf.native import parse_native_pages
from packages.documents.pdf.renderer import render_page
from packages.documents.text import TextNormalizer


logger = logging.getLogger(__name__)


def convert_pdf_to_text(
    source: Path,
    destination: Path,
    *,
    job_id: str,
    report_progress: Callable[[int], None],
) -> Path:
    report_progress(10)
    native_pages = parse_native_pages(source)
    page_text = [page.text for page in native_pages]
    ocr_page_numbers = [page.number for page in native_pages if not has_usable_native_text(page.text)]
    logger.info(
        "PDF text detection job_id=%s pages=%d native_pages=%d ocr_pages=%d",
        job_id,
        len(native_pages),
        len(native_pages) - len(ocr_page_numbers),
        len(ocr_page_numbers),
    )
    report_progress(25)
    if ocr_page_numbers:
        _ocr_pages(source, page_text, ocr_page_numbers, job_id=job_id, report_progress=report_progress)

    normalizer = TextNormalizer()
    normalized_pages = [normalizer.normalize(text) for text in page_text]
    output = normalizer.normalize("\n\n".join(normalized_pages))
    destination.write_text(f"{output}\n" if output else "", encoding="utf-8")
    report_progress(90)
    return destination


def _ocr_pages(
    source: Path,
    page_text: list[str],
    page_numbers: list[int],
    *,
    job_id: str,
    report_progress: Callable[[int], None],
) -> None:
    with pymupdf.open(source) as document, tempfile.TemporaryDirectory() as directory:
        temporary_directory = Path(directory)
        for completed, page_number in enumerate(page_numbers, start=1):
            image_path = temporary_directory / f"page-{page_number + 1}.png"
            render_page(document[page_number], image_path)
            page_text[page_number] = extract_text(image_path, job_id=job_id).text
            report_progress(25 + int(60 * completed / len(page_numbers)))
