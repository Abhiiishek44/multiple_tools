from dataclasses import dataclass
from typing import Literal

from packages.auth.scopes import ALL_SCOPES


AuthenticationMethod = Literal["user", "api_key"]


@dataclass(frozen=True, slots=True)
class AuthenticatedActor:
    """A verified user or API key acting on behalf of a user."""

    user_id: str
    authentication_method: AuthenticationMethod
    scopes: frozenset[str]
    api_key_id: str | None = None

    @classmethod
    def for_user(cls, user_id: str) -> "AuthenticatedActor":
        return cls(
            user_id=user_id,
            authentication_method="user",
            scopes=ALL_SCOPES,
        )

    @classmethod
    def for_api_key(
        cls, owner_user_id: str, key_id: str, scopes: frozenset[str]
    ) -> "AuthenticatedActor":
        return cls(
            user_id=owner_user_id,
            authentication_method="api_key",
            scopes=scopes,
            api_key_id=key_id,
        )

    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes
