import re
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

_NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass(frozen=True, slots=True)
class PluginOptionChoice:
    value: str | int
    label: str


@dataclass(frozen=True, slots=True)
class PluginOption:
    name: str
    label: str
    type: Literal["text", "password", "select"] = "text"
    required: bool = False
    description: str = ""
    default: str | int | None = None
    choices: tuple[PluginOptionChoice, ...] = ()


@dataclass(frozen=True, slots=True)
class PluginManifest:
    name: str
    version: str
    description: str
    input_suffixes: frozenset[str]
    input_media_types: frozenset[str]
    output_suffix: str
    output_media_type: str
    options: tuple[PluginOption, ...] = ()

    def validate(self) -> None:
        if not _NAME_PATTERN.fullmatch(self.name):
            raise ValueError(f"Invalid plugin name: {self.name}")
        if not self.version or not self.input_suffixes or not self.input_media_types:
            raise ValueError(f"Plugin {self.name} requires a version and input types")
        if any(not suffix.startswith(".") for suffix in self.input_suffixes):
            raise ValueError(f"Plugin {self.name} has an invalid input suffix")
        if not self.output_suffix.startswith("."):
            raise ValueError(f"Plugin {self.name} has an invalid output suffix")
        option_names = [option.name for option in self.options]
        if len(option_names) != len(set(option_names)):
            raise ValueError(f"Plugin {self.name} has duplicate option names")
        for option in self.options:
            if not option.name or (option.type == "select" and not option.choices):
                raise ValueError(f"Plugin {self.name} has an invalid option")


@dataclass(frozen=True, slots=True)
class ToolContext:
    job_id: str
    report_progress: Callable[[int], None]
    options: Mapping[str, object] = field(default_factory=dict)


PluginHandler = Callable[[ToolContext, Path, Path], Path]


@dataclass(frozen=True, slots=True)
class Plugin:
    manifest: PluginManifest
    execute: PluginHandler
