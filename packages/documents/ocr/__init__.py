"""Reusable OCR functionality backed by the configured provider."""

from pathlib import Path

from packages.documents.ocr.base import OcrProvider
from packages.documents.ocr.exceptions import (
    OcrConfigurationError,
    OcrError,
    OcrInputError,
    OcrRequestError,
    OcrResponseError,
)
from packages.documents.ocr.factory import get_ocr_provider
from packages.documents.ocr.models import OcrResult


def extract_text(source: Path, *, job_id: str | None = None) -> OcrResult:
    return get_ocr_provider().extract_text(source, job_id=job_id)


__all__ = [
    "OcrConfigurationError",
    "OcrError",
    "OcrInputError",
    "OcrProvider",
    "OcrRequestError",
    "OcrResponseError",
    "OcrResult",
    "extract_text",
    "get_ocr_provider",
]
