from collections.abc import Iterator
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import BinaryIO, Protocol


@dataclass(frozen=True, slots=True)
class StoredObject:
    key: str
    last_modified: datetime


class ArtifactStorage(Protocol):
    def save_stream(self, key: str, stream: BinaryIO, maximum_bytes: int) -> int: ...

    def upload_file(self, key: str, source: Path) -> None: ...

    def download_file(self, key: str, destination: Path) -> None: ...

    def open_reader(self, key: str) -> BinaryIO: ...

    def exists(self, key: str) -> bool: ...

    def delete(self, key: str) -> None: ...

    def iter_objects(self, prefix: str) -> Iterator[StoredObject]: ...
