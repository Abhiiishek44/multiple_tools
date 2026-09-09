from dataclasses import dataclass
from pathlib import Path

import pymupdf


@dataclass(frozen=True, slots=True)
class NativePage:
    number: int
    text: str


def parse_native_pages(source: Path) -> list[NativePage]:
    pages: list[NativePage] = []
    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        for number, page in enumerate(document):
            pages.append(
                NativePage(number=number, text=page.get_text("text", sort=True))
            )
    return pages
