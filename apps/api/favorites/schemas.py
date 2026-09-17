from pydantic import BaseModel, Field


class FavoritesResponse(BaseModel):
    tool_slugs: list[str]


class FavoritesSyncRequest(BaseModel):
    tool_slugs: list[str] = Field(default_factory=list, max_length=200)
