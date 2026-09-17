import unittest
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

from packages.love import repository
from packages.love.models import LoveStatus


class LoveRepositoryTests(unittest.TestCase):
    @staticmethod
    def _connection_with_row(row):
        connection = MagicMock()
        connection.execute.return_value.fetchone.return_value = row

        @contextmanager
        def connection_context():
            yield connection

        return connection, connection_context

    @patch("packages.love.repository.database_connection")
    def test_get_status_uses_typed_user_predicate(self, database_connection):
        connection, connection_context = self._connection_with_row(
            {"count": 1, "loved": True}
        )
        database_connection.side_effect = connection_context

        result = repository.get_status(
            user_id="16710f10-2ed8-4f16-b91d-c595c74efcbb",
            anonymous_id_hash=None,
        )

        query, params = connection.execute.call_args.args
        self.assertIn("loves.user_id = %s::uuid", query)
        self.assertNotIn("%s IS NOT NULL", query)
        self.assertEqual(params, ("16710f10-2ed8-4f16-b91d-c595c74efcbb",))
        self.assertEqual(result, LoveStatus(count=1, loved=True))

    @patch("packages.love.repository.database_connection")
    def test_get_status_uses_typed_anonymous_predicate(self, database_connection):
        connection, connection_context = self._connection_with_row(
            {"count": 0, "loved": False}
        )
        database_connection.side_effect = connection_context

        result = repository.get_status(
            user_id=None,
            anonymous_id_hash="a" * 64,
        )

        query, params = connection.execute.call_args.args
        self.assertIn("loves.anonymous_id_hash = %s::text", query)
        self.assertIn("site_love_device_users", query)
        self.assertNotIn("%s IS NOT NULL", query)
        self.assertEqual(params, ("a" * 64, "a" * 64))
        self.assertEqual(result, LoveStatus(count=0, loved=False))

    def test_get_status_requires_an_identity(self):
        with self.assertRaisesRegex(ValueError, "identity is required"):
            repository.get_status(user_id=None, anonymous_id_hash=None)

    @patch("packages.love.repository.database_connection")
    def test_merge_transfers_anonymous_love_to_user(self, database_connection):
        connection = MagicMock()
        connection.execute.return_value.fetchone.side_effect = [None, {"id": 7}]

        @contextmanager
        def connection_context():
            yield connection

        database_connection.side_effect = connection_context

        repository.merge_anonymous_love(
            user_id="16710f10-2ed8-4f16-b91d-c595c74efcbb",
            anonymous_id_hash="a" * 64,
        )

        link_query, link_params = connection.execute.call_args_list[2].args
        self.assertIn("INSERT INTO site_love_device_users", link_query)
        self.assertEqual(
            link_params,
            ("a" * 64, "16710f10-2ed8-4f16-b91d-c595c74efcbb"),
        )
        update_query, update_params = connection.execute.call_args_list[3].args
        self.assertIn("UPDATE site_loves", update_query)
        self.assertEqual(
            update_params,
            ("16710f10-2ed8-4f16-b91d-c595c74efcbb", 7),
        )

    @patch("packages.love.repository.database_connection")
    def test_merge_removes_duplicate_anonymous_love(self, database_connection):
        connection = MagicMock()
        connection.execute.return_value.fetchone.side_effect = [{"id": 3}, {"id": 7}]

        @contextmanager
        def connection_context():
            yield connection

        database_connection.side_effect = connection_context

        repository.merge_anonymous_love(
            user_id="16710f10-2ed8-4f16-b91d-c595c74efcbb",
            anonymous_id_hash="a" * 64,
        )

        delete_query, delete_params = connection.execute.call_args_list[3].args
        self.assertIn("DELETE FROM site_loves", delete_query)
        self.assertEqual(delete_params, (7,))


if __name__ == "__main__":
    unittest.main()
