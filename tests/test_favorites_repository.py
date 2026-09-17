import unittest
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

from packages.favorites import repository


class FavoritesRepositoryTests(unittest.TestCase):
    @patch("packages.favorites.repository.database_connection")
    def test_add_many_uses_psycopg_cursor_executemany(self, database_connection):
        connection = MagicMock()
        cursor = MagicMock()
        connection.cursor.return_value.__enter__.return_value = cursor

        @contextmanager
        def connection_context():
            yield connection

        database_connection.side_effect = connection_context

        repository.add_many("user-1", ("png-to-jpg", "rotate-pdf"))

        connection.cursor.assert_called_once_with()
        cursor.executemany.assert_called_once()
        parameters = cursor.executemany.call_args.args[1]
        self.assertEqual(
            parameters,
            [("user-1", "png-to-jpg"), ("user-1", "rotate-pdf")],
        )
        connection.executemany.assert_not_called()


if __name__ == "__main__":
    unittest.main()
