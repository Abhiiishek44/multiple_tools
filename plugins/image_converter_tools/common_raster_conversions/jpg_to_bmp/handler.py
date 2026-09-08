from pathlib import Path

from plugins.base import ToolContext
from plugins.image_converter_tools.conversion import convert_image


def convert(context: ToolContext, source: Path, destination: Path) -> Path:
    return convert_image(context, source, destination, output_format="BMP")
