from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from packages.api_keys.models import ApiKey
from packages.auth.scopes import ALL_SCOPES


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    scopes: list[str] = Field(min_length=1, max_length=len(ALL_SCOPES))
    expires_at: datetime | None = None

    @field_validator("scopes")
    @classmethod
    def validate_scopes(cls, scopes: list[str]) -> list[str]:
        if len(scopes) != len(set(scopes)):
            raise ValueError("API key scopes must be unique")
        unknown = set(scopes) - ALL_SCOPES
        if unknown:
            raise ValueError(f"Unknown API key scopes: {', '.join(sorted(unknown))}")
        return scopes


class ApiKeyResponse(BaseModel):
    key_id: str
    name: str
    scopes: list[str]
    created_at: datetime
    last_used_at: datetime | None
    expires_at: datetime | None
    revoked_at: datetime | None

    @classmethod
    def from_api_key(cls, api_key: ApiKey) -> "ApiKeyResponse":
        return cls(
            key_id=api_key.key_id,
            name=api_key.name,
            scopes=sorted(api_key.scopes),
            created_at=api_key.created_at,
            last_used_at=api_key.last_used_at,
            expires_at=api_key.expires_at,
            revoked_at=api_key.revoked_at,
        )


class ApiKeyCreateResponse(ApiKeyResponse):
    api_key: str

    @classmethod
    def from_created(cls, api_key: ApiKey, raw_key: str) -> "ApiKeyCreateResponse":
        metadata = ApiKeyResponse.from_api_key(api_key)
        return cls(**metadata.model_dump(), api_key=raw_key)
