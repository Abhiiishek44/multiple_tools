import logging
import tempfile
from pathlib import Path

import pymupdf

from packages.ocr import extract_text
from packages.pdf_text import (
    TextNormalizer,
    has_usable_native_text,
    parse_native_pages,
    render_page,
)
from plugins.base import ToolContext


logger = logging.getLogger(__name__)


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(10)
    native_pages = parse_native_pages(source)
    page_text = [page.text for page in native_pages]
    ocr_page_numbers = [
        page.number
        for page in native_pages
        if not has_usable_native_text(page.text)
    ]
    logger.info(
        "PDF text detection job_id=%s pages=%d native_pages=%d ocr_pages=%d",
        context.job_id,
        len(native_pages),
        len(native_pages) - len(ocr_page_numbers),
        len(ocr_page_numbers),
    )
    context.report_progress(25)

    if ocr_page_numbers:
        _ocr_pages(context, source, page_text, ocr_page_numbers)

    normalizer = TextNormalizer()
    normalized_pages = [normalizer.normalize(text) for text in page_text]
    output = normalizer.normalize("\n\n".join(normalized_pages))
    destination.write_text(f"{output}\n" if output else "", encoding="utf-8")
    context.report_progress(90)
    return destination


def _ocr_pages(
    context: ToolContext,
    source: Path,
    page_text: list[str],
    page_numbers: list[int],
) -> None:
    with pymupdf.open(source) as document, tempfile.TemporaryDirectory() as directory:
        temporary_directory = Path(directory)
        for completed, page_number in enumerate(page_numbers, start=1):
            image_path = temporary_directory / f"page-{page_number + 1}.png"
            render_page(document[page_number], image_path)
            page_text[page_number] = extract_text(
                image_path, job_id=context.job_id
            ).text
            context.report_progress(25 + int(60 * completed / len(page_numbers)))
