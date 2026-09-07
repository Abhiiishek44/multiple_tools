import shutil
import subprocess
import tempfile
from pathlib import Path

import markdown

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable is None:
        raise RuntimeError("LibreOffice is required and 'soffice' must be on PATH")

    body = markdown.markdown(
        source.read_text(encoding="utf-8-sig"), extensions=["extra", "sane_lists"]
    )
    intermediate = destination.parent / f"{source.stem}.html"
    intermediate.write_text(
        "<!doctype html><html><head><meta charset='utf-8'></head>"
        f"<body>{body}</body></html>",
        encoding="utf-8",
    )
    context.report_progress(35)
    with tempfile.TemporaryDirectory(prefix="libreoffice-") as profile:
        completed = subprocess.run(
            [
                executable,
                "--headless",
                f"-env:UserInstallation={Path(profile).resolve().as_uri()}",
                "--convert-to",
                "pdf:writer_web_pdf_Export",
                "--outdir",
                str(destination.parent),
                str(intermediate),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=300,
        )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(f"LibreOffice conversion failed: {detail}")
    generated = destination.parent / f"{intermediate.stem}.pdf"
    if not generated.is_file():
        raise RuntimeError("LibreOffice produced no PDF output")
    if generated != destination:
        generated.replace(destination)
    context.report_progress(90)
    return destination
