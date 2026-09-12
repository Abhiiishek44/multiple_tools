import csv
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font

from plugins.base import ToolContext
from plugins.shared.libreoffice import convert_with_libreoffice


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
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
    return convert_with_libreoffice(
        context, intermediate, destination, start_progress=None
    )
