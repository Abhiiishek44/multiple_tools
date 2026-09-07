from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    from pdf2docx import Converter

    context.report_progress(10)
    converter = Converter(str(source))
    try:
        converter.convert(str(destination))
    finally:
        converter.close()
    context.report_progress(90)
    return destination
