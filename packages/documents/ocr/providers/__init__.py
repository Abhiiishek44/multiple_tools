from .base import OcrProvider
from .openrouter import OpenRouterOcrProvider
from .registry import create_provider, provider_names, register_provider

register_provider("openrouter", OpenRouterOcrProvider)

__all__ = ["OcrProvider", "OpenRouterOcrProvider", "create_provider", "provider_names", "register_provider"]
