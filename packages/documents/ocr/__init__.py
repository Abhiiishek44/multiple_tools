"""Provider-independent document OCR functionality."""

from .exceptions import (
    OcrConfigurationError,
    OcrError,
    OcrInputError,
    OcrRequestError,
    OcrResponseError,
)
from .models import OcrResult
from .providers import OcrProvider
from .service import OcrService, extract_text, get_ocr_service


__all__ = [
    "OcrConfigurationError",
    "OcrError",
    "OcrInputError",
    "OcrProvider",
    "OcrRequestError",
    "OcrResponseError",
    "OcrResult",
    "OcrService",
    "extract_text",
    "get_ocr_service",
]
