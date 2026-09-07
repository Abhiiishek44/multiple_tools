class ApplicationError(Exception):
    """Base class for expected application failures."""


class NotFoundError(ApplicationError):
    pass


class ConflictError(ApplicationError):
    pass


class ValidationError(ApplicationError):
    pass
