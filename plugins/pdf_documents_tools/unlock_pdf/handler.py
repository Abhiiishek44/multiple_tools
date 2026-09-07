from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    password = context.options.get("password")
    if not isinstance(password, str) or not password:
        raise ValueError("Option 'password' is required")

    context.report_progress(20)
    with pymupdf.open(source) as document:
        if document.needs_pass and document.authenticate(password) == 0:
            raise ValueError("Incorrect PDF password")
        document.save(
            destination,
            encryption=pymupdf.PDF_ENCRYPT_NONE,
            garbage=4,
            deflate=True,
        )
    context.report_progress(90)
    return destination
