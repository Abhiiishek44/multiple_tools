from packages.storage import get_storage
from packages.storage.base import ArtifactStorage


def storage_dependency() -> ArtifactStorage:
    return get_storage()
