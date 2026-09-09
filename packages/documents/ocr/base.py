from pathlib import Path
from typing import Protocol

from packages.documents.ocr.models import OcrResult


class OcrProvider(Protocol):
    """Contract implemented by an OCR provider adapter."""

    def extract_text(self, source: Path, *, job_id: str | None = None) -> OcrResult: ...
