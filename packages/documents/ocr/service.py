from pathlib import Path
from functools import lru_cache

from packages.core.config import Settings, get_settings

from .models import OcrResult
from .providers import OcrProvider, create_provider


class OcrService:
    """Application-facing OCR service independent of a concrete vendor."""

    def __init__(self, provider: OcrProvider) -> None:
        self.provider = provider

    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "OcrService":
        return cls(create_provider("openrouter", settings or get_settings()))

    def extract_text(self, source: Path, *, job_id: str | None = None) -> OcrResult:
        return self.provider.extract_text(Path(source), job_id=job_id)


@lru_cache(maxsize=1)
def get_ocr_service() -> OcrService:
    """Return the configured process-wide OCR service."""
    return OcrService.from_settings()


def extract_text(source: Path, *, job_id: str | None = None) -> OcrResult:
    """Extract text using the configured OCR provider."""
    return get_ocr_service().extract_text(source, job_id=job_id)
