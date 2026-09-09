from functools import lru_cache

from packages.core.config import get_settings
from packages.documents.ocr.base import OcrProvider
from packages.documents.ocr.openrouter import OpenRouterOcrProvider


@lru_cache(maxsize=1)
def get_ocr_provider() -> OcrProvider:
    """Return the configured OCR provider used by plugins and document services."""
    return OpenRouterOcrProvider(get_settings())
