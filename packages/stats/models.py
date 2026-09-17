from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ToolConversionStats:
    total: int
    successful: int


@dataclass(frozen=True, slots=True)
class PublicStats:
    total_conversions: int
    today_conversions: int
    successful_conversions: int
    per_tool: dict[str, ToolConversionStats]
