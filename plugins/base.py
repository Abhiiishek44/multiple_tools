import re
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path


_NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass(frozen=True, slots=True)
class PluginManifest:
    name: str
    version: str
    description: str
    input_suffixes: frozenset[str]
    input_media_types: frozenset[str]
    output_suffix: str
    output_media_type: str

    def validate(self) -> None:
        if not _NAME_PATTERN.fullmatch(self.name):
            raise ValueError(f"Invalid plugin name: {self.name}")
        if not self.version or not self.input_suffixes or not self.input_media_types:
            raise ValueError(f"Plugin {self.name} requires a version and input types")
        if any(not suffix.startswith(".") for suffix in self.input_suffixes):
            raise ValueError(f"Plugin {self.name} has an invalid input suffix")
        if not self.output_suffix.startswith("."):
            raise ValueError(f"Plugin {self.name} has an invalid output suffix")


@dataclass(frozen=True, slots=True)
class ToolContext:
    job_id: str
    report_progress: Callable[[int], None]


PluginHandler = Callable[[ToolContext, Path, Path], Path]


@dataclass(frozen=True, slots=True)
class Plugin:
    manifest: PluginManifest
    execute: PluginHandler
