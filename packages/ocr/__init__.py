"""Reusable OCR functionality backed exclusively by OpenRouter."""

from packages.ocr.exceptions import (
    OcrConfigurationError,
    OcrError,
    OcrInputError,
    OcrRequestError,
    OcrResponseError,
)
from packages.ocr.models import OcrResult
from packages.ocr.openrouter import extract_text

__all__ = [
    "OcrConfigurationError",
    "OcrError",
    "OcrInputError",
    "OcrRequestError",
    "OcrResponseError",
    "OcrResult",
    "extract_text",
]
