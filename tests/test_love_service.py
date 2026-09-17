import unittest
from unittest.mock import patch

from packages.love import service
from packages.love.models import LoveStatus


class LoveServiceTests(unittest.TestCase):
    @patch("packages.love.service._device_hash", return_value="a" * 64)
    @patch("packages.love.service.repository.get_status")
    def test_duplicate_anonymous_love_is_idempotent(
        self, get_status, _device_hash
    ):
        get_status.return_value = LoveStatus(count=1, loved=True)

        result = service.send_love(
            user_id=None, device_id="device", client_ip="127.0.0.1"
        )

        self.assertEqual(result, LoveStatus(count=1, loved=True))

    @patch("packages.love.service._anonymous_rate_allowed", return_value=True)
    @patch("packages.love.service._device_hash", return_value="a" * 64)
    @patch("packages.love.service.repository.add")
    @patch("packages.love.service.repository.get_status")
    def test_anonymous_love_is_persisted(
        self, get_status, repository_add, _device_hash, _rate_allowed
    ):
        get_status.side_effect = [
            LoveStatus(count=0, loved=False),
            LoveStatus(count=1, loved=True),
        ]

        result = service.send_love(
            user_id=None, device_id="device", client_ip="127.0.0.1"
        )

        repository_add.assert_called_once_with(
            user_id=None, anonymous_id_hash="a" * 64
        )
        self.assertEqual(result.count, 1)
        self.assertTrue(result.loved)

    @patch("packages.love.service.repository.add")
    @patch("packages.love.service.repository.get_status")
    def test_logged_in_user_does_not_use_anonymous_rate_limit(
        self, get_status, repository_add
    ):
        get_status.side_effect = [
            LoveStatus(count=0, loved=False),
            LoveStatus(count=1, loved=True),
        ]

        service.send_love(
            user_id="user-1", device_id="device", client_ip="127.0.0.1"
        )

        repository_add.assert_called_once_with(
            user_id="user-1", anonymous_id_hash=None
        )

    @patch("packages.love.service._device_hash", return_value="a" * 64)
    @patch("packages.love.service.repository.merge_anonymous_love")
    def test_merge_hashes_the_anonymous_device_id(
        self, merge_anonymous_love, _device_hash
    ):
        service.merge_anonymous_love(user_id="user-1", device_id="device")

        merge_anonymous_love.assert_called_once_with(
            user_id="user-1", anonymous_id_hash="a" * 64
        )


if __name__ == "__main__":
    unittest.main()
