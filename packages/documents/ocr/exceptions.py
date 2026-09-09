class OcrError(RuntimeError):
    """Base error raised by the OCR package."""


class OcrConfigurationError(OcrError):
    """OCR configuration is missing or invalid."""


class OcrInputError(OcrError):
    """The source image cannot safely be submitted for OCR."""


class OcrRequestError(OcrError):
    """The OCR provider request failed."""


class OcrResponseError(OcrError):
    """The OCR provider returned an unusable response."""
