"""Artifact storage contract and configured adapter."""

from packages.storage.base import ArtifactStorage, StoredObject
from packages.storage.factory import get_storage


__all__ = ["ArtifactStorage", "StoredObject", "get_storage"]
