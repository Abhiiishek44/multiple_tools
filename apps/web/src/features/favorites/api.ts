import { apiRequest } from '../../shared/api/client'
import type { FavoritesResponse } from './types'

export async function getFavorites() {
  const response = await apiRequest<FavoritesResponse>('/v1/favorites')
  return response.tool_slugs
}

export async function addFavorite(toolSlug: string) {
  const response = await apiRequest<FavoritesResponse>(`/v1/favorites/${encodeURIComponent(toolSlug)}`, {
    method: 'PUT',
  })
  return response.tool_slugs
}

export function removeFavorite(toolSlug: string) {
  return apiRequest<void>(`/v1/favorites/${encodeURIComponent(toolSlug)}`, {
    method: 'DELETE',
  })
}

export async function syncFavorites(toolSlugs: string[]) {
  const response = await apiRequest<FavoritesResponse>('/v1/favorites/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool_slugs: toolSlugs }),
  })
  return response.tool_slugs
}
