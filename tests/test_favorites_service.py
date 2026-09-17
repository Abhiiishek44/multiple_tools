import unittest
from unittest.mock import patch

from packages.core.errors import ValidationError
from packages.favorites import service


class FavoritesServiceTests(unittest.TestCase):
    @patch("packages.favorites.service.repository.list_for_user")
    @patch("packages.favorites.service.cache.get")
    def test_list_uses_cached_favorites(self, cache_get, repository_list):
        cache_get.return_value = ("png-to-jpg",)

        result = service.list_favorites("user-1")

        self.assertEqual(result, ("png-to-jpg",))
        repository_list.assert_not_called()

    @patch("packages.favorites.service.list_favorites")
    @patch("packages.favorites.service.cache.delete")
    @patch("packages.favorites.service.repository.add_many")
    def test_merge_deduplicates_guest_favorites(
        self, repository_add_many, cache_delete, list_favorites
    ):
        list_favorites.return_value = ("png-to-jpg", "rotate-pdf")

        result = service.merge_favorites(
            "user-1", ["png-to-jpg", "png-to-jpg", "rotate-pdf"]
        )

        repository_add_many.assert_called_once_with(
            "user-1", ("png-to-jpg", "rotate-pdf")
        )
        cache_delete.assert_called_once_with("user-1")
        self.assertEqual(result, ("png-to-jpg", "rotate-pdf"))

    def test_rejects_invalid_tool_slug(self):
        with self.assertRaises(ValidationError):
            service.add_favorite("user-1", "../../not-a-tool")

    def test_limits_sync_payload(self):
        with self.assertRaises(ValidationError):
            service.merge_favorites(
                "user-1", [f"tool-{index}" for index in range(201)]
            )


if __name__ == "__main__":
    unittest.main()
