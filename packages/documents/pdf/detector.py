import re
import unicodedata


_WORD_PATTERN = re.compile(r"[^\W_]+(?:['’\-][^\W_]+)*", re.UNICODE)
_REPEATED_CHARACTER_PATTERN = re.compile(r"([^\W_])\1{5,}", re.UNICODE)


def _is_bad_character(character: str) -> bool:
    category = unicodedata.category(character)
    return character == "\ufffd" or category in {"Cc", "Cs", "Co", "Cn"}


def has_usable_native_text(text: str) -> bool:
    """Return whether native extraction looks useful enough to skip OCR.

    This is deliberately deterministic. A PDF text layer can be non-empty but
    still contain broken font mappings, control characters, punctuation noise,
    or one glyph per token. Those pages should use the OCR fallback.
    """
    characters = [character for character in text if not character.isspace()]
    if not characters:
        return False

    character_count = len(characters)
    alphanumeric_count = sum(character.isalnum() for character in characters)
    bad_character_count = sum(
        _is_bad_character(character) for character in characters
    )

    # Hard failures indicate an empty or corrupt text layer, regardless of the
    # other signals. Unicode letters and numbers are supported intentionally.
    if alphanumeric_count < 3:
        return False
    if bad_character_count / character_count > 0.02:
        return False
    if alphanumeric_count / character_count < 0.35:
        return False

    words = _WORD_PATTERN.findall(text)
    if not words:
        return False

    # Broken PDF encodings commonly produce long streams of isolated glyphs.
    if len(words) >= 8:
        single_character_words = sum(len(word) == 1 for word in words)
        if single_character_words / len(words) > 0.6:
            return False

    # Reject obvious repeated-glyph corruption while allowing separators and
    # short legitimate values such as invoice numbers or page labels.
    repeated = sum(
        len(match.group(0))
        for match in _REPEATED_CHARACTER_PATTERN.finditer(text)
    )
    if repeated / character_count > 0.2:
        return False

    if character_count < 20:
        return any(len(word) >= 2 for word in words)

    word_characters = sum(len(word) for word in words)
    substantial_words = sum(len(word) >= 2 for word in words)
    return word_characters / alphanumeric_count >= 0.7 and substantial_words >= 2
