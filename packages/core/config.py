import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    celery_broker_url: str
    celery_result_backend: str
    storage_backend: str
    local_storage_path: Path
    max_upload_bytes: int
    s3_bucket: str | None
    s3_endpoint_url: str | None
    s3_region: str | None

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            database_url=os.getenv(
                "DATABASE_URL", "postgresql://app:app@localhost:5433/app"
            ),
            celery_broker_url=os.getenv(
                "CELERY_BROKER_URL", "redis://localhost:6380/0"
            ),
            celery_result_backend=os.getenv(
                "CELERY_RESULT_BACKEND", "redis://localhost:6380/1"
            ),
            storage_backend=os.getenv("STORAGE_BACKEND", "local").lower(),
            local_storage_path=Path(os.getenv("LOCAL_STORAGE_PATH", "storage")),
            max_upload_bytes=int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024))),
            s3_bucket=os.getenv("S3_BUCKET"),
            s3_endpoint_url=os.getenv("S3_ENDPOINT_URL"),
            s3_region=os.getenv("S3_REGION"),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_environment()
