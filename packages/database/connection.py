from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import psycopg
from psycopg import Connection
from psycopg.rows import dict_row

from packages.core.config import get_settings


@contextmanager
def database_connection(database_url: str | None = None) -> Iterator[Connection[Any]]:
    url = database_url or get_settings().database_url
    with psycopg.connect(url, row_factory=dict_row) as connection:
        yield connection
