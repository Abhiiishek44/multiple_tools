from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from apps.api.dependencies import require_authenticated_user
from apps.api.favorites.schemas import FavoritesResponse, FavoritesSyncRequest
from packages.auth.models import User
from packages.core.errors import ValidationError
from packages.favorites import service

router = APIRouter(prefix="/v1/favorites", tags=["favorites"])


@router.get("", response_model=FavoritesResponse)
def list_favorites(
    user: Annotated[User, Depends(require_authenticated_user)],
) -> FavoritesResponse:
    return FavoritesResponse(tool_slugs=list(service.list_favorites(user.id)))


@router.put("/{tool_slug}", response_model=FavoritesResponse)
def add_favorite(
    tool_slug: str,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> FavoritesResponse:
    try:
        favorites = service.add_favorite(user.id, tool_slug)
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return FavoritesResponse(tool_slugs=list(favorites))


@router.delete("/{tool_slug}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    tool_slug: str,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> Response:
    try:
        service.remove_favorite(user.id, tool_slug)
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/sync", response_model=FavoritesResponse)
def sync_favorites(
    request: FavoritesSyncRequest,
    user: Annotated[User, Depends(require_authenticated_user)],
) -> FavoritesResponse:
    try:
        favorites = service.merge_favorites(user.id, request.tool_slugs)
    except ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return FavoritesResponse(tool_slugs=list(favorites))
