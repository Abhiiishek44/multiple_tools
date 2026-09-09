import re
import unicodedata


_HORIZONTAL_WHITESPACE = re.compile(r"[ \t]+")
_EXCESS_BLANK_LINES = re.compile(r"\n{3,}")


class TextNormalizer:
    """Clean text deterministically without rewriting document content."""

    def normalize(self, text: str) -> str:
        normalized = unicodedata.normalize("NFC", text)
        normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
        normalized = "".join(self._clean_character(char) for char in normalized)
        lines = [_HORIZONTAL_WHITESPACE.sub(" ", line).strip() for line in normalized.split("\n")]
        normalized = "\n".join(lines)
        normalized = _EXCESS_BLANK_LINES.sub("\n\n", normalized)
        return normalized.strip()

    @staticmethod
    def _clean_character(character: str) -> str:
        if character in {"\n", "\t"}:
            return character
        if unicodedata.category(character) == "Cc":
            return ""
        if character.isspace():
            return " "
        return character
