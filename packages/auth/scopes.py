from typing import Final


TOOLS_READ: Final = "tools:read"
JOBS_CREATE: Final = "jobs:create"
JOBS_READ: Final = "jobs:read"
JOBS_DOWNLOAD: Final = "jobs:download"

ALL_SCOPES: Final[frozenset[str]] = frozenset(
    {TOOLS_READ, JOBS_CREATE, JOBS_READ, JOBS_DOWNLOAD}
)


def validate_scopes(scopes: set[str] | frozenset[str]) -> frozenset[str]:
    normalized = frozenset(scopes)
    unknown = normalized - ALL_SCOPES
    if unknown:
        raise ValueError(f"Unknown API key scopes: {', '.join(sorted(unknown))}")
    if not normalized:
        raise ValueError("At least one API key scope is required")
    return normalized
