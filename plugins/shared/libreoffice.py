import shutil
import subprocess
import tempfile
from pathlib import Path

from plugins.base import ToolContext


_PDF_FILTERS = {
    ".htm": "writer_web_pdf_Export",
    ".html": "writer_web_pdf_Export",
    ".xls": "calc_pdf_Export",
    ".xlsx": "calc_pdf_Export",
    ".ppt": "impress_pdf_Export",
    ".pptx": "impress_pdf_Export",
}


def convert_with_libreoffice(
    context: ToolContext,
    source: Path,
    destination: Path,
    *,
    start_progress: int | None = 10,
) -> Path:
    """Run an isolated headless LibreOffice conversion."""
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable is None:
        raise RuntimeError("LibreOffice is required and 'soffice' must be on PATH")

    if start_progress is not None:
        context.report_progress(start_progress)
    output_spec = _output_spec(source, destination)
    with tempfile.TemporaryDirectory(prefix="libreoffice-") as profile:
        completed = subprocess.run(
            [
                executable,
                "--headless",
                f"-env:UserInstallation={Path(profile).resolve().as_uri()}",
                "--convert-to",
                output_spec,
                "--outdir",
                str(destination.parent),
                str(source),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=300,
        )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(f"LibreOffice conversion failed: {detail}")

    generated = destination.parent / f"{source.stem}{destination.suffix}"
    if not generated.is_file():
        raise RuntimeError(
            f"LibreOffice produced no {destination.suffix.lstrip('.').upper()} output"
        )
    if generated != destination:
        generated.replace(destination)
    context.report_progress(90)
    return destination


def _output_spec(source: Path, destination: Path) -> str:
    suffix = destination.suffix.lower()
    if suffix == ".pdf":
        export_filter = _PDF_FILTERS.get(source.suffix.lower(), "writer_pdf_Export")
        return f"pdf:{export_filter}"
    if suffix == ".docx":
        return "docx:Office Open XML Text"
    if suffix in {".htm", ".html"}:
        return "html:HTML"
    raise ValueError(f"Unsupported LibreOffice output suffix: {destination.suffix}")
