from collections.abc import Callable

from packages.core.config import Settings

from ..exceptions import OcrConfigurationError
from .base import OcrProvider

ProviderFactory = Callable[[Settings], OcrProvider]
_providers: dict[str, ProviderFactory] = {}


def register_provider(name: str, factory: ProviderFactory) -> None:
    normalized = name.strip().lower()
    if not normalized:
        raise ValueError("OCR provider name cannot be empty")
    _providers[normalized] = factory


def create_provider(name: str, settings: Settings) -> OcrProvider:
    try:
        factory = _providers[name.strip().lower()]
    except KeyError as error:
        available = ", ".join(sorted(_providers)) or "none"
        raise OcrConfigurationError(f"Unknown OCR provider {name!r}; available providers: {available}") from error
    return factory(settings)


def provider_names() -> tuple[str, ...]:
    return tuple(sorted(_providers))
