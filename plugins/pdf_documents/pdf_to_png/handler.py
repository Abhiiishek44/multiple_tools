import tempfile
import zipfile
from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    import pymupdf

    with pymupdf.open(source) as document:
        if document.page_count == 0:
            raise ValueError("PDF contains no pages")
        with tempfile.TemporaryDirectory(prefix="pdf-png-") as directory:
            image_directory = Path(directory)
            with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED) as archive:
                for index, page in enumerate(document):
                    image = image_directory / f"page-{index + 1:04d}.png"
                    page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False).save(image)
                    archive.write(image, image.name)
                    context.report_progress(10 + int(80 * (index + 1) / document.page_count))
    return destination
