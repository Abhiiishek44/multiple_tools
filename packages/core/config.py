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
    minio_addressing_style: str
    minio_secure: bool
    minio_auto_create_bucket: bool
    minio_temp_prefix: str
    minio_temp_retention_minutes: int
    minio_cleanup_interval_minutes: int
    openrouter_api_key: str | None
    openrouter_base_url: str
    openrouter_ocr_model: str | None
    openrouter_timeout_seconds: int
    ocr_max_pixels: int
    ocr_max_payload_bytes: int
    google_client_id: str | None
    jwt_secret: str | None
    jwt_expiration_minutes: int
    jwt_issuer: str
    jwt_audience: str
    frontend_url: str
    auth_cookie_name: str
    auth_cookie_secure: bool
    cors_origins: tuple[str, ...]
    api_key_hmac_secret: str | None = None

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            database_url=os.getenv("DATABASE_URL", "postgresql://app:app@localhost:5433/app"),
            celery_broker_url=os.getenv("CELERY_BROKER_URL", "redis://localhost:6380/0"),
            celery_result_backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6380/1"),
            storage_backend=os.getenv("STORAGE_BACKEND", "minio").lower(),
            max_upload_bytes=int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024))),
            minio_bucket=os.getenv("MINIO_BUCKET", "multiple-tools"),
            minio_endpoint=os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            minio_access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
            minio_secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
            minio_region=os.getenv("MINIO_REGION", "us-east-1"),
            minio_addressing_style=_choice(
                "MINIO_ADDRESSING_STYLE", "auto", {"auto", "path", "virtual"}
            ),
            minio_secure=_boolean("MINIO_SECURE", False),
            minio_auto_create_bucket=_boolean("MINIO_AUTO_CREATE_BUCKET", True),
            minio_temp_prefix=_object_prefix("MINIO_TEMP_PREFIX", os.getenv("MINIO_TEMP_PREFIX", "jobs/")),
            minio_temp_retention_minutes=_positive_integer("MINIO_TEMP_RETENTION_MINUTES", "30"),
            minio_cleanup_interval_minutes=_positive_integer("MINIO_CLEANUP_INTERVAL_MINUTES", "30"),
            openrouter_api_key=os.getenv("OPENROUTER_API_KEY") or None,
            openrouter_base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/"),
            openrouter_ocr_model=os.getenv("OPENROUTER_OCR_MODEL") or None,
            openrouter_timeout_seconds=_positive_integer("OPENROUTER_TIMEOUT_SECONDS", "120"),
            ocr_max_pixels=_positive_integer("OCR_MAX_PIXELS", "40000000"),
            ocr_max_payload_bytes=_positive_integer("OCR_MAX_PAYLOAD_BYTES", str(20 * 1024 * 1024)),
            google_client_id=os.getenv("GOOGLE_CLIENT_ID") or None,
            jwt_secret=os.getenv("JWT_SECRET") or None,
            jwt_expiration_minutes=int(os.getenv("JWT_EXPIRATION_MINUTES", "60")),
            jwt_issuer=os.getenv("JWT_ISSUER", "multiple-tools-api"),
            jwt_audience=os.getenv("JWT_AUDIENCE", "multiple-tools-web"),
            api_key_hmac_secret=os.getenv("API_KEY_HMAC_SECRET") or None,
            frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
            auth_cookie_name=os.getenv("AUTH_COOKIE_NAME", "multiple_tools_access_token"),
            auth_cookie_secure=_boolean("AUTH_COOKIE_SECURE", False),
            cors_origins=tuple(origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()),
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


def _positive_integer(name: str, default: str) -> int:
    value = int(os.getenv(name, default))
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")
    return value


def _object_prefix(name: str, value: str) -> str:
    normalized = value.strip().strip("/")
    if not normalized or any(part in {".", ".."} for part in normalized.split("/")):
        raise ValueError(f"{name} must be a non-empty safe object prefix")
    return f"{normalized}/"


def _choice(name: str, default: str, choices: set[str]) -> str:
    value = os.getenv(name, default).strip().lower()
    if value not in choices:
        allowed = ", ".join(sorted(choices))
        raise ValueError(f"{name} must be one of: {allowed}")
    return value
