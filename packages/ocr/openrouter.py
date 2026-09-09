import base64
import logging
import time
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

from packages.config import Settings, get_settings
from packages.ocr.exceptions import (
    OcrConfigurationError,
    OcrInputError,
    OcrRequestError,
    OcrResponseError,
)
from packages.ocr.models import OcrResult
from packages.ocr.prompts import OCR_SYSTEM_PROMPT


logger = logging.getLogger(__name__)

_MAX_RETRIES = 2
_RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}


def extract_text(
    source: Path,
    *,
    job_id: str | None = None,
    settings: Settings | None = None,
) -> OcrResult:
    configuration = settings or get_settings()
    if not configuration.openrouter_api_key:
        raise OcrConfigurationError("OPENROUTER_API_KEY is not configured")
    if not configuration.openrouter_ocr_model:
        raise OcrConfigurationError("OPENROUTER_OCR_MODEL is not configured")

    image_url = _encode_image(
        source,
        maximum_pixels=configuration.ocr_max_pixels,
        maximum_payload_bytes=configuration.ocr_max_payload_bytes,
    )
    started_at = time.monotonic()
    response = _send_request(configuration, image_url, job_id)
    result = _result_from_payload(
        _response_payload(response), configuration.openrouter_ocr_model
    )
    logger.info(
        "OCR completed job_id=%s model=%s input_tokens=%s output_tokens=%s "
        "cost=%s duration_ms=%d",
        job_id,
        result.model,
        result.input_tokens,
        result.output_tokens,
        result.cost,
        round((time.monotonic() - started_at) * 1000),
    )
    return result


def _send_request(
    settings: Settings, image_url: str, job_id: str | None
) -> requests.Response:
    url = f"{settings.openrouter_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.openrouter_ocr_model,
        "messages": [
            {"role": "system", "content": OCR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}}
                ],
            },
        ],
        "temperature": 0,
    }

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=settings.openrouter_timeout_seconds,
            )
        except (requests.ConnectionError, requests.Timeout) as error:
            if attempt == _MAX_RETRIES:
                raise OcrRequestError("OpenRouter OCR request failed") from error
            _wait_before_retry(attempt, job_id, reason=type(error).__name__)
            continue
        except requests.RequestException as error:
            raise OcrRequestError("OpenRouter OCR request failed") from error

        if response.ok:
            return response
        if (
            response.status_code not in _RETRYABLE_STATUS_CODES
            or attempt == _MAX_RETRIES
        ):
            raise OcrRequestError(
                f"OpenRouter OCR returned HTTP {response.status_code}"
            )
        _wait_before_retry(attempt, job_id, reason=f"HTTP {response.status_code}")

    raise OcrRequestError("OpenRouter OCR request failed")


def _wait_before_retry(attempt: int, job_id: str | None, *, reason: str) -> None:
    delay = 2**attempt
    logger.warning(
        "Retrying OCR job_id=%s reason=%s attempt=%d delay_seconds=%d",
        job_id,
        reason,
        attempt + 1,
        delay,
    )
    time.sleep(delay)


def _response_payload(response: requests.Response) -> dict[str, Any]:
    try:
        payload = response.json()
    except ValueError as error:
        raise OcrResponseError("OpenRouter OCR returned invalid JSON") from error
    if not isinstance(payload, dict):
        raise OcrResponseError("OpenRouter OCR returned an invalid response")
    return payload


def _result_from_payload(payload: dict[str, Any], requested_model: str) -> OcrResult:
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise OcrResponseError("OpenRouter OCR returned an invalid response") from error

    text = _text_content(content).strip()
    if not text:
        raise OcrResponseError("OpenRouter OCR returned no text")

    usage = payload.get("usage")
    if not isinstance(usage, dict):
        usage = {}
    model = payload.get("model")
    return OcrResult(
        text=text,
        model=model if isinstance(model, str) and model else requested_model,
        input_tokens=_optional_int(usage.get("prompt_tokens")),
        output_tokens=_optional_int(usage.get("completion_tokens")),
        cost=_optional_float(usage.get("cost")),
    )


def _encode_image(
    source: Path, *, maximum_pixels: int, maximum_payload_bytes: int
) -> str:
    if source.suffix.lower() in {".heic", ".heif"}:
        from pillow_heif import register_heif_opener

        register_heif_opener()

    try:
        with Image.open(source) as opened:
            width, height = opened.size
            if width <= 0 or height <= 0 or width * height > maximum_pixels:
                raise OcrInputError(
                    f"OCR image exceeds the {maximum_pixels}-pixel limit"
                )
            image = ImageOps.exif_transpose(opened)
            converted = _rgb_image(image)
            try:
                encoded_bytes, media_type = _encoded_content(
                    converted, preserve_jpeg=source.suffix.lower() in {".jpg", ".jpeg"}
                )
            finally:
                converted.close()
                if image is not opened:
                    image.close()
    except OcrInputError:
        raise
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError) as error:
        raise OcrInputError("OCR input is not a valid supported image") from error

    encoded = base64.b64encode(encoded_bytes)
    if len(encoded) > maximum_payload_bytes:
        raise OcrInputError(
            f"OCR image payload exceeds the {maximum_payload_bytes}-byte limit"
        )
    return f"data:{media_type};base64,{encoded.decode('ascii')}"


def _rgb_image(image: Image.Image) -> Image.Image:
    if "A" not in image.getbands() and "transparency" not in image.info:
        return image.convert("RGB")
    rgba = image.convert("RGBA")
    result = Image.new("RGB", rgba.size, "white")
    result.paste(rgba, mask=rgba.getchannel("A"))
    rgba.close()
    return result


def _encoded_content(image: Image.Image, *, preserve_jpeg: bool) -> tuple[bytes, str]:
    with BytesIO() as buffer:
        if preserve_jpeg:
            image.save(buffer, "JPEG", quality=95, optimize=True)
            return buffer.getvalue(), "image/jpeg"
        image.save(buffer, "PNG", optimize=True)
        return buffer.getvalue(), "image/png"


def _text_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            part["text"]
            for part in content
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        )
    raise OcrResponseError("OpenRouter OCR response did not contain text")


def _optional_int(value: Any) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _optional_float(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return None
