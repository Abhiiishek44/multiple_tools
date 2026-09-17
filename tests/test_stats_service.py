import unittest
from unittest.mock import patch

from packages.stats import service
from packages.stats.models import PublicStats, ToolConversionStats


class PublicStatsServiceTests(unittest.TestCase):
    @patch("packages.stats.service.repository.get_public_stats")
    @patch("packages.stats.service._get_cached")
    def test_uses_cached_stats(self, get_cached, repository_get):
        expected = PublicStats(10, 2, 8, {"rotate-pdf": ToolConversionStats(4, 3)})
        get_cached.return_value = expected

        self.assertEqual(service.get_public_stats(), expected)
        repository_get.assert_not_called()

    @patch("packages.stats.service._set_cached")
    @patch("packages.stats.service.repository.get_public_stats")
    @patch("packages.stats.service._get_cached", return_value=None)
    def test_queries_database_and_populates_cache(
        self, _get_cached, repository_get, set_cached
    ):
        expected = PublicStats(10, 2, 8, {})
        repository_get.return_value = expected

        self.assertEqual(service.get_public_stats(), expected)
        set_cached.assert_called_once_with(expected)


if __name__ == "__main__":
    unittest.main()
