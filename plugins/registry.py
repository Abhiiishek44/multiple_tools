import logging
import re
from functools import lru_cache
from importlib import import_module
from pathlib import Path
from types import MappingProxyType
from typing import Mapping

from plugins.base import Plugin, PluginManifest


logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def versioned_plugin_registry() -> Mapping[tuple[str, str], Plugin]:
    discovered: dict[tuple[str, str], Plugin] = {}
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
        identity = (manifest.name, manifest.version)
        if identity in discovered:
            raise ValueError(
                f"Duplicate plugin name and version: {manifest.name} {manifest.version}"
            )
        discovered[identity] = Plugin(manifest=manifest, execute=handler)
        logger.info("Registered plugin name=%s version=%s", manifest.name, manifest.version)

    logger.info("Discovered %d plugins", len(discovered))
    return MappingProxyType(discovered)


@lru_cache(maxsize=1)
def plugin_registry() -> Mapping[str, Plugin]:
    """Return the newest installed version of every named plugin."""
    current: dict[str, Plugin] = {}
    for plugin in versioned_plugin_registry().values():
        previous = current.get(plugin.manifest.name)
        if previous is None or _version_key(previous.manifest.version) < _version_key(
            plugin.manifest.version
        ):
            current[plugin.manifest.name] = plugin
    return MappingProxyType(current)


def get_plugin(name: str, version: str | None = None) -> Plugin:
    if version is not None:
        try:
            return versioned_plugin_registry()[(name, version)]
        except KeyError as error:
            available = ", ".join(
                sorted(
                    candidate_version
                    for candidate_name, candidate_version in versioned_plugin_registry()
                    if candidate_name == name
                )
            ) or "none"
            raise KeyError(
                f"Unknown plugin '{name}' version '{version}'. "
                f"Available versions: {available}"
            ) from error
    try:
        return plugin_registry()[name]
    except KeyError as error:
        available = ", ".join(sorted(plugin_registry())) or "none"
        raise KeyError(f"Unknown plugin '{name}'. Available plugins: {available}") from error


def list_plugins() -> tuple[Plugin, ...]:
    return tuple(plugin_registry()[name] for name in sorted(plugin_registry()))


def _version_key(value: str) -> tuple[int, int, int, int, str]:
    """Build a stable ordering key for the semantic versions used by plugins."""
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)(?:[-+](.*))?", value)
    if match is None:
        return (-1, -1, -1, -1, value)
    major, minor, patch, prerelease = match.groups()
    return (int(major), int(minor), int(patch), prerelease is None, prerelease or "")
