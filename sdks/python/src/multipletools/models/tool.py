from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from multipletools.exceptions import ResponseValidationError


@dataclass(frozen=True, slots=True)
class Tool:
    name: str
    version: str
    description: str
    input_suffixes: tuple[str, ...]
    input_media_types: tuple[str, ...]
    output_suffix: str
    output_media_type: str

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "Tool":
        try:
            return cls(
                name=str(data["name"]),
                version=str(data["version"]),
                description=str(data["description"]),
                input_suffixes=tuple(str(v) for v in data["input_suffixes"]),
                input_media_types=tuple(str(v) for v in data["input_media_types"]),
                output_suffix=str(data["output_suffix"]),
                output_media_type=str(data["output_media_type"]),
            )
        except (KeyError, TypeError, ValueError) as error:
            raise ResponseValidationError(f"Invalid tool response: {error}") from error
