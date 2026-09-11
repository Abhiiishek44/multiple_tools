import logging
import time
from pathlib import Path
from typing import Any

from openrouter import OpenRouter
from openrouter.errors import OpenRouterError

from packages.core.config import Settings

from ...exceptions import OcrConfigurationError, OcrRequestError, OcrResponseError
from ...models import OcrResult
from ...preprocessing import encode_image_data_url
from .prompt import OCR_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class OpenRouterOcrProvider:
    """OCR adapter for OpenRouter's chat-completions API."""

    def __init__(self, settings: Settings, *, client: OpenRouter | None = None) -> None:
        self.settings = settings
        self._client = client or OpenRouter(
            api_key=settings.openrouter_api_key,
            server_url=settings.openrouter_base_url,
            timeout_ms=settings.openrouter_timeout_seconds * 1000,
        )

    def extract_text(self, source: Path, *, job_id: str | None = None) -> OcrResult:
        self._validate_configuration()
        image_url = encode_image_data_url(
            source,
            maximum_pixels=self.settings.ocr_max_pixels,
            maximum_payload_bytes=self.settings.ocr_max_payload_bytes,
        )
        started_at = time.monotonic()
        result = parse_ocr_response(
            self._send(image_url, job_id=job_id),
            self.settings.openrouter_ocr_model or "",
        )
        logger.info(
            "OCR completed job_id=%s model=%s input_tokens=%s output_tokens=%s cost=%s duration_ms=%d",
            job_id, result.model, result.input_tokens, result.output_tokens,
            result.cost, round((time.monotonic() - started_at) * 1000),
        )
        return result

    def _validate_configuration(self) -> None:
        if not self.settings.openrouter_api_key:
            raise OcrConfigurationError("OPENROUTER_API_KEY is not configured")
        if not self.settings.openrouter_ocr_model:
            raise OcrConfigurationError("OPENROUTER_OCR_MODEL is not configured")

    def _send(self, image_url: str, *, job_id: str | None) -> dict[str, Any]:
        try:
            response = self._client.chat.send(
                model=self.settings.openrouter_ocr_model,
                messages=[
                {"role": "system", "content": OCR_SYSTEM_PROMPT},
                {"role": "user", "content": [{"type": "image_url", "image_url": {"url": image_url}}]},
                ],
                temperature=0,
            )
        except OpenRouterError as error:
            raise OcrRequestError(
                f"OpenRouter OCR request failed for job {job_id or 'unknown'}"
            ) from error
        return response.model_dump()


def parse_ocr_response(payload: dict[str, Any], requested_model: str) -> OcrResult:
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise OcrResponseError("OpenRouter OCR returned an invalid response") from error
    text = _text_content(content).strip()
    if not text:
        raise OcrResponseError("OpenRouter OCR returned no text")
    usage = payload.get("usage")
    usage = usage if isinstance(usage, dict) else {}
    model = payload.get("model")
    return OcrResult(
        text=text,
        model=model if isinstance(model, str) and model else requested_model,
        input_tokens=_optional_int(usage.get("prompt_tokens")),
        output_tokens=_optional_int(usage.get("completion_tokens")),
        cost=_optional_float(usage.get("cost")),
    )


def _text_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(part["text"] for part in content if isinstance(part, dict) and isinstance(part.get("text"), str))
    raise OcrResponseError("OpenRouter OCR response did not contain text")


def _optional_int(value: Any) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _optional_float(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) else None
