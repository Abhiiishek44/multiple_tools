from pathlib import Path
from tempfile import TemporaryDirectory

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    mode = context.options.get("mode", "editable")
    if mode == "editable":
        return _convert_editable(context, source, destination)
    if mode != "preserve-layout":
        raise ValueError("mode must be either 'preserve-layout' or 'editable'")

    return _convert_preserving_layout(context, source, destination)


def _convert_editable(
    context: ToolContext, source: Path, destination: Path
) -> Path:
    from pdf2docx import Converter

    context.report_progress(10)
    converter = Converter(str(source))
    try:
        converter.convert(str(destination))
    finally:
        converter.close()
    context.report_progress(90)
    return destination


def _convert_preserving_layout(
    context: ToolContext, source: Path, destination: Path
) -> Path:
    """Create one full-page Word image per PDF page.

    PDF pages use fixed coordinates while editable Word content reflows. Rendering
    pages first is the only deterministic way to preserve the original layout in
    DOCX across Word-compatible applications.
    """
    import pymupdf
    from docx import Document
    from docx.enum.section import WD_SECTION
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Emu, Pt

    pdf = pymupdf.open(source)
    if pdf.page_count == 0:
        pdf.close()
        raise ValueError("PDF contains no pages")

    document = Document()
    try:
        with TemporaryDirectory(prefix="pdf-to-word-") as directory:
            for index, page in enumerate(pdf):
                section = (
                    document.sections[0]
                    if index == 0
                    else document.add_section(WD_SECTION.NEW_PAGE)
                )
                page_width = Emu(round(page.rect.width / 72 * 914400))
                page_height = Emu(round(page.rect.height / 72 * 914400))
                section.page_width = page_width
                section.page_height = page_height
                section.top_margin = Emu(0)
                section.right_margin = Emu(0)
                section.bottom_margin = Emu(0)
                section.left_margin = Emu(0)
                section.header_distance = Emu(0)
                section.footer_distance = Emu(0)

                image_path = Path(directory) / f"page-{index + 1}.png"
                # 144 dpi provides print-quality text while keeping output files
                # reasonably sized (PDF coordinates use 72 points per inch).
                pixmap = page.get_pixmap(
                    matrix=pymupdf.Matrix(2, 2), alpha=False
                )
                pixmap.save(image_path)

                paragraph = document.add_paragraph()
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                paragraph.paragraph_format.space_before = Pt(0)
                paragraph.paragraph_format.space_after = Pt(0)
                run = paragraph.add_run()
                # Leave a tiny vertical tolerance so different Word renderers do
                # not push a full-height image onto an additional blank page.
                run.add_picture(
                    str(image_path),
                    width=page_width,
                    height=Emu(max(1, int(page_height) - 12700)),
                )

                progress = 10 + round(80 * (index + 1) / pdf.page_count)
                context.report_progress(progress)

            document.save(destination)
    finally:
        pdf.close()

    return destination
