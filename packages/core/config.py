import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    celery_broker_url: str
    celery_result_backend: str
    storage_backend: str
    max_upload_bytes: int
    minio_bucket: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_region: str
    minio_secure: bool
    minio_auto_create_bucket: bool
    google_client_id: str | None
    jwt_secret: str | None
    jwt_expiration_minutes: int
    jwt_issuer: str
    jwt_audience: str
    frontend_url: str
    auth_cookie_name: str
    auth_cookie_secure: bool
    cors_origins: tuple[str, ...]

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
            storage_backend=os.getenv("STORAGE_BACKEND", "minio").lower(),
            max_upload_bytes=int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024))),
            minio_bucket=os.getenv("MINIO_BUCKET", "multiple-tools"),
            minio_endpoint=os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            minio_access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
            minio_secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
            minio_region=os.getenv("MINIO_REGION", "us-east-1"),
            minio_secure=_boolean("MINIO_SECURE", False),
            minio_auto_create_bucket=_boolean("MINIO_AUTO_CREATE_BUCKET", True),
            google_client_id=os.getenv("GOOGLE_CLIENT_ID") or None,
            jwt_secret=os.getenv("JWT_SECRET") or None,
            jwt_expiration_minutes=int(os.getenv("JWT_EXPIRATION_MINUTES", "60")),
            jwt_issuer=os.getenv("JWT_ISSUER", "multiple-tools-api"),
            jwt_audience=os.getenv("JWT_AUDIENCE", "multiple-tools-web"),
            frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
            auth_cookie_name=os.getenv(
                "AUTH_COOKIE_NAME", "multiple_tools_access_token"
            ),
            auth_cookie_secure=_boolean("AUTH_COOKIE_SECURE", False),
            cors_origins=tuple(
                origin.strip()
                for origin in os.getenv(
                    "CORS_ORIGINS", "http://localhost:5173"
                ).split(",")
                if origin.strip()
            ),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_environment()


def _boolean(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be true or false")
