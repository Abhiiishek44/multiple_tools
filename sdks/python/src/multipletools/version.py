from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("multipletools")
except PackageNotFoundError:  # pragma: no cover - editable source fallback
    __version__ = "0.1.0"
