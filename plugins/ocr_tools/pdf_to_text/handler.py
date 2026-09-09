from pathlib import Path

from packages.documents.pdf import convert_pdf_to_text
from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    return convert_pdf_to_text(
        source,
        destination,
        job_id=context.job_id,
        report_progress=context.report_progress,
    )
