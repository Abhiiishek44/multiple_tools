import shutil
import subprocess
import tempfile
from pathlib import Path

from docx import Document

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable is None:
        raise RuntimeError("LibreOffice is required and 'soffice' must be on PATH")

    context.report_progress(10)
    document = Document()
    for line in source.read_text(encoding="utf-8-sig").splitlines():
        document.add_paragraph(line)
    intermediate = destination.parent / f"{source.stem}.docx"
    document.save(intermediate)
    context.report_progress(40)

    with tempfile.TemporaryDirectory(prefix="libreoffice-") as profile:
        completed = subprocess.run(
            [
                executable,
                "--headless",
                f"-env:UserInstallation={Path(profile).resolve().as_uri()}",
                "--convert-to",
                "pdf:writer_pdf_Export",
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
