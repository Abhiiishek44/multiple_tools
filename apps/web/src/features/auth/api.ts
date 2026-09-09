import { API_BASE_URL, apiRequest } from '../../shared/api/client'
import type { AuthenticatedUser } from './types'

export function getCurrentUser() {
  return apiRequest<AuthenticatedUser>('/v1/auth/me')
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
  if (!response.ok && response.status !== 204) throw new Error('Could not sign out.')
}
