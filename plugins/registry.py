import logging
from functools import lru_cache
from importlib import import_module
from pathlib import Path
from types import MappingProxyType
from typing import Mapping

from plugins.base import Plugin, PluginManifest


logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def plugin_registry() -> Mapping[str, Plugin]:
    discovered: dict[str, Plugin] = {}
    plugins_directory = Path(__file__).parent

    for manifest_path in sorted(plugins_directory.rglob("manifest.py")):
        directory = manifest_path.parent
        relative_directory = directory.relative_to(plugins_directory)
        if any(part.startswith("_") for part in relative_directory.parts):
            continue
        if not (directory / "handler.py").is_file():
            raise ValueError(f"Plugin manifest has no handler: {relative_directory}")
        module = ".".join(("plugins", *relative_directory.parts))
        manifest: PluginManifest = import_module(f"{module}.manifest").MANIFEST
        handler = import_module(f"{module}.handler").convert
        manifest.validate()
        if manifest.name in discovered:
            raise ValueError(f"Duplicate plugin name: {manifest.name}")
        discovered[manifest.name] = Plugin(manifest=manifest, execute=handler)
        logger.info("Registered plugin name=%s version=%s", manifest.name, manifest.version)

    logger.info("Discovered %d plugins", len(discovered))
    return MappingProxyType(discovered)


def get_plugin(name: str) -> Plugin:
    try:
        return plugin_registry()[name]
    except KeyError as error:
        available = ", ".join(sorted(plugin_registry())) or "none"
        raise KeyError(f"Unknown plugin '{name}'. Available plugins: {available}") from error


def list_plugins() -> tuple[Plugin, ...]:
    return tuple(plugin_registry()[name] for name in sorted(plugin_registry()))
