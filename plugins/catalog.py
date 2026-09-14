from __future__ import annotations

from collections.abc import Iterable

from plugins.base import PluginManifest, PluginOption

CATEGORY_DETAILS = {
    "PDF": "Convert, edit, secure, and optimize PDF files",
    "Documents": "Convert Word, text, Markdown, and web documents",
    "Spreadsheets": "Convert Excel, CSV, and tabular documents",
    "Images": "Convert images between modern raster formats",
    "OCR": "Extract editable text from images and scanned PDFs",
}

_DISPLAY_NAMES = {
    "avif": "AVIF",
    "bmp": "BMP",
    "csv": "CSV",
    "excel": "Excel",
    "heic": "HEIC",
    "html": "HTML",
    "image": "Image",
    "jpg": "JPG",
    "markdown": "Markdown",
    "pdf": "PDF",
    "png": "PNG",
    "powerpoint": "PowerPoint",
    "text": "Text",
    "tiff": "TIFF",
    "webp": "WebP",
    "word": "Word",
    "to": "to",
}


def build_tool_catalog(manifests: Iterable[PluginManifest]) -> list[dict[str, object]]:
    base = [_base_metadata(manifest) for manifest in sorted(manifests, key=lambda item: item.name)]
    for tool in base:
        tool["related_tools"] = _related_tools(tool, base)
    return base


def _base_metadata(manifest: PluginManifest) -> dict[str, object]:
    source, target = _source_and_target(manifest)
    name = _friendly_name(manifest.name)
    input_formats = [_format_suffix(value) for value in sorted(manifest.input_suffixes)]
    output_formats = [_format_suffix(manifest.output_suffix)]
    category = _category(manifest.name)
    description = manifest.description.rstrip(".") + "."
    return {
        "name": manifest.name,
        "slug": manifest.name,
        "version": manifest.version,
        "display_name": name,
        "title": f"{name} Online",
        "description": description,
        "category": category,
        "category_slug": category.lower().replace(" ", "-"),
        "category_description": CATEGORY_DETAILS[category],
        "input_suffixes": sorted(manifest.input_suffixes),
        "input_media_types": sorted(manifest.input_media_types),
        "input_formats": input_formats,
        "output_suffix": manifest.output_suffix,
        "output_media_type": manifest.output_media_type,
        "output_formats": output_formats,
        "features": [
            f"Convert {source} to {target} with a focused browser workflow",
            "Typed API and SDK support for automated workflows",
            "Live job progress with reliable output downloads",
            "Responsive, keyboard-accessible upload experience",
        ],
        "options": [_option_metadata(option) for option in manifest.options],
        "keywords": [manifest.name, name.lower(), f"{source.lower()} to {target.lower()}", category.lower()],
        "faq": [
            {
                "question": f"How do I use {name}?",
                "answer": f"Upload a supported {source} file, choose any available settings, start the tool, and download the resulting {target} file.",
            },
            {
                "question": f"Which formats does {name} support?",
                "answer": f"Accepted input formats are {', '.join(input_formats)}. The output format is {', '.join(output_formats)}.",
            },
            {
                "question": "Is my original file changed?",
                "answer": "No. The original file remains on your device and the tool creates a separate output file.",
            },
            {
                "question": "Can I use this tool through the API?",
                "answer": f"Yes. Create a job with the {manifest.name} tool slug, then poll and download it with the API or an SDK.",
            },
        ],
        "how_it_works": [
            f"Choose a supported {source} file from your device.",
            "Review the available settings and start the job.",
            f"Follow progress and download the finished {target} file.",
        ],
        "related_tools": [],
    }


def _option_metadata(option: PluginOption) -> dict[str, object]:
    return {
        "name": option.name,
        "label": option.label,
        "type": option.type,
        "required": option.required,
        "description": option.description,
        "default": option.default,
        "choices": [{"value": choice.value, "label": choice.label} for choice in option.choices],
    }


def _category(name: str) -> str:
    if name in {"image-to-text", "pdf-to-text"}:
        return "OCR"
    if "pdf" in name:
        return "PDF"
    if "excel" in name or "csv" in name:
        return "Spreadsheets"
    if name.startswith(("avif-", "bmp-", "heic-", "jpg-", "png-", "tiff-", "webp-")):
        return "Images"
    return "Documents"


def _source_and_target(manifest: PluginManifest) -> tuple[str, str]:
    if "-to-" in manifest.name:
        source, target = manifest.name.split("-to-", 1)
    else:
        action, source = manifest.name.split("-", 1)
        target = f"optimized {source}" if action == "compress" else source
    return _DISPLAY_NAMES.get(source, source.upper()), _DISPLAY_NAMES.get(target, target.upper())


def _friendly_name(name: str) -> str:
    return " ".join(_DISPLAY_NAMES.get(part, part.capitalize()) for part in name.split("-"))


def _format_suffix(suffix: str) -> str:
    value = suffix.removeprefix(".").lower()
    return {"jpeg": "JPG", "docx": "DOCX", "xlsx": "XLSX", "pptx": "PPTX"}.get(value, value.upper())


def _related_tools(tool: dict[str, object], tools: list[dict[str, object]]) -> list[str]:
    input_formats = set(tool["input_formats"])
    output_formats = set(tool["output_formats"])

    def score(candidate: dict[str, object]) -> tuple[int, str]:
        value = 4 if candidate["category"] == tool["category"] else 0
        value += 5 if output_formats.intersection(candidate["input_formats"]) else 0
        value += 2 if input_formats.intersection(candidate["input_formats"]) else 0
        return (-value, str(candidate["slug"]))

    candidates = [candidate for candidate in tools if candidate["slug"] != tool["slug"]]
    return [str(candidate["slug"]) for candidate in sorted(candidates, key=score)[:6]]
