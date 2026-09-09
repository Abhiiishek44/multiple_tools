from pathlib import Path

import pymupdf


def render_page(page: pymupdf.Page, destination: Path, *, dpi: int = 144) -> Path:
    scale = dpi / 72
    pixmap = page.get_pixmap(
        matrix=pymupdf.Matrix(scale, scale),
        colorspace=pymupdf.csRGB,
        alpha=False,
    )
    pixmap.save(destination)
    return destination
