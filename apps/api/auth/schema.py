from pydantic import BaseModel, Field

from packages.core.models import User


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(min_length=1, max_length=10_000)


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture_url: str | None

    @classmethod
    def from_user(cls, user: User) -> "UserResponse":
        return cls(
            id=user.id,
            email=user.email,
            name=user.name,
            picture_url=user.picture_url,
        )


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
