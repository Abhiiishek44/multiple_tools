from pathlib import Path
from typing import Protocol, runtime_checkable

from ..models import OcrResult


@runtime_checkable
class OcrProvider(Protocol):
    """Contract implemented by OCR provider adapters."""

    def extract_text(self, source: Path, *, job_id: str | None = None) -> OcrResult: ...
