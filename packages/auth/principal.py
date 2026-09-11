from dataclasses import dataclass
from typing import Literal

from packages.auth.scopes import ALL_SCOPES


PrincipalKind = Literal["user", "api_key"]


@dataclass(frozen=True, slots=True)
class Principal:
    owner_id: str
    kind: PrincipalKind
    scopes: frozenset[str]
    api_key_id: str | None = None

    @classmethod
    def for_user(cls, user_id: str) -> "Principal":
        return cls(owner_id=user_id, kind="user", scopes=ALL_SCOPES)

    @classmethod
    def for_api_key(
        cls, owner_id: str, key_id: str, scopes: frozenset[str]
    ) -> "Principal":
        return cls(
            owner_id=owner_id,
            kind="api_key",
            scopes=scopes,
            api_key_id=key_id,
        )

    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes
