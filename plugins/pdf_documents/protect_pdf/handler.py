from pathlib import Path

import pymupdf

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    password = context.options.get("password")
    owner_password = context.options.get("owner_password", password)
    if not isinstance(password, str) or not password:
        raise ValueError("Option 'password' is required")
    if not isinstance(owner_password, str) or not owner_password:
        raise ValueError("Option 'owner_password' must be a non-empty string")
    if len(password) > 127 or len(owner_password) > 127:
        raise ValueError("PDF passwords must contain at most 127 characters")

    context.report_progress(20)
    with pymupdf.open(source) as document:
        if document.needs_pass:
            raise ValueError("Input PDF is already password-protected")
        document.save(
            destination,
            encryption=pymupdf.PDF_ENCRYPT_AES_256,
            user_pw=password,
            owner_pw=owner_password,
            garbage=4,
            deflate=True,
        )
    context.report_progress(90)
    return destination
