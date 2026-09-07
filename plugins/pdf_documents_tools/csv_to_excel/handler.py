import csv
from pathlib import Path

from openpyxl import Workbook

from plugins.base import ToolContext


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    context.report_progress(10)
    workbook = Workbook(write_only=True)
    sheet = workbook.create_sheet("Data")
    with source.open("r", encoding="utf-8-sig", newline="") as stream:
        sample = stream.read(8192)
        stream.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample)
        except csv.Error:
            dialect = csv.excel
        for row in csv.reader(stream, dialect):
            sheet.append(row)
    workbook.save(destination)
    context.report_progress(90)
    return destination
