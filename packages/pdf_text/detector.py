import unicodedata


def has_usable_native_text(text: str) -> bool:
    """Return whether native extraction produced readable document text."""
    characters = [character for character in text if not character.isspace()]
    if not characters:
        return False

    meaningful = sum(character.isalnum() for character in characters)
    controls = sum(
        unicodedata.category(character).startswith("C") for character in characters
    )
    replacements = text.count("\ufffd")

    return (
        meaningful >= 3
        and meaningful / len(characters) >= 0.2
        and controls / len(characters) <= 0.1
        and replacements / len(characters) <= 0.1
    )
