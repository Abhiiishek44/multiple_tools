import { API_BASE_URL, apiRequest, responseError } from '../../shared/api/client'
import { ApiError } from '../../shared/api/errors'
import type { AuthenticatedUser } from './types'

export function getCurrentUser() {
  return apiRequest<AuthenticatedUser>('/v1/auth/me')
}

export async function completeGoogleSignIn(credential: string) {
  const response = await fetch(`${API_BASE_URL}/v1/auth/google/callback`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
  if (!response.ok) throw new ApiError(await responseError(response), response.status)
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
  if (!response.ok && response.status !== 204) throw new Error('Could not sign out.')
}
