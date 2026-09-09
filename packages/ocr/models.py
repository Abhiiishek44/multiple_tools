from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class OcrResult:
    text: str
    model: str
    input_tokens: int | None = None
    output_tokens: int | None = None
    cost: float | None = None
