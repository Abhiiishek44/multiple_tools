import shutil
import subprocess
import tempfile
from pathlib import Path

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable is None:
        raise RuntimeError("LibreOffice is required and 'soffice' must be on PATH")
    context.report_progress(10)
    with tempfile.TemporaryDirectory(prefix="libreoffice-") as profile:
        completed = subprocess.run(
            [executable, "--headless", f"-env:UserInstallation={Path(profile).resolve().as_uri()}",
             "--convert-to", "pdf", "--outdir", str(destination.parent), str(source)],
            check=False, capture_output=True, text=True, timeout=300,
        )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(f"LibreOffice conversion failed: {detail}")
    generated = destination.parent / f"{source.stem}.pdf"
    if generated != destination and generated.exists():
        generated.replace(destination)
    context.report_progress(90)
    return destination
