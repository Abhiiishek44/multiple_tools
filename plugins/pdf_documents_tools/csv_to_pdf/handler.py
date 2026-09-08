import csv
import shutil
import subprocess
import tempfile
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    executable = shutil.which("soffice") or shutil.which("libreoffice")
    if executable is None:
        raise RuntimeError("LibreOffice is required and 'soffice' must be on PATH")

    workbook = Workbook()
    sheet = workbook.active
    if sheet is None:
        raise RuntimeError("Could not create worksheet")
    sheet.title = "Data"
    with source.open("r", encoding="utf-8-sig", newline="") as stream:
        sample = stream.read(8192)
        stream.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample)
        except csv.Error:
            dialect = csv.excel
        for row_index, row in enumerate(csv.reader(stream, dialect), start=1):
            sheet.append(row)
            if row_index == 1:
                for cell in sheet[row_index]:
                    cell.font = Font(bold=True)
    intermediate = destination.parent / f"{source.stem}.xlsx"
    workbook.save(intermediate)
    context.report_progress(40)

    with tempfile.TemporaryDirectory(prefix="libreoffice-") as profile:
        completed = subprocess.run(
            [
                executable,
                "--headless",
                f"-env:UserInstallation={Path(profile).resolve().as_uri()}",
                "--convert-to",
                "pdf:calc_pdf_Export",
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
