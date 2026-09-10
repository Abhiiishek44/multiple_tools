from functools import lru_cache

from packages.core.config import get_settings
from packages.storage.base import ArtifactStorage
from packages.storage.minio import MinioStorage


@lru_cache(maxsize=1)
def get_storage() -> ArtifactStorage:
    settings = get_settings()
    if settings.storage_backend != "minio":
        raise ValueError("STORAGE_BACKEND must be 'minio'")
    return MinioStorage(
        bucket=settings.minio_bucket,
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        region=settings.minio_region,
        addressing_style=settings.minio_addressing_style,
        secure=settings.minio_secure,
        auto_create_bucket=settings.minio_auto_create_bucket,
    )
