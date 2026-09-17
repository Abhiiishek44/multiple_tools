from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class LoveStatus:
    count: int
    loved: bool
