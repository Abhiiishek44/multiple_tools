import re
from collections.abc import Iterable

from packages.core.errors import ValidationError
from packages.favorites import cache, repository

TOOL_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_SYNC_ITEMS = 200


def list_favorites(user_id: str) -> tuple[str, ...]:
    cached = cache.get(user_id)
    if cached is not None:
        return cached
    slugs = tuple(item.tool_slug for item in repository.list_for_user(user_id))
    cache.set(user_id, slugs)
    return slugs


def add_favorite(user_id: str, tool_slug: str) -> tuple[str, ...]:
    repository.add(user_id, _validate_slug(tool_slug))
    cache.delete(user_id)
    return list_favorites(user_id)


def remove_favorite(user_id: str, tool_slug: str) -> None:
    repository.remove(user_id, _validate_slug(tool_slug))
    cache.delete(user_id)


def merge_favorites(user_id: str, tool_slugs: Iterable[str]) -> tuple[str, ...]:
    unique = tuple(dict.fromkeys(tool_slugs))
    if len(unique) > MAX_SYNC_ITEMS:
        raise ValidationError(f"Cannot sync more than {MAX_SYNC_ITEMS} favorites")
    validated = tuple(_validate_slug(slug) for slug in unique)
    repository.add_many(user_id, validated)
    cache.delete(user_id)
    return list_favorites(user_id)


def _validate_slug(tool_slug: str) -> str:
    normalized = tool_slug.strip().lower()
    if not normalized or len(normalized) > 120 or not TOOL_SLUG_PATTERN.fullmatch(normalized):
        raise ValidationError("Invalid tool slug")
    return normalized
