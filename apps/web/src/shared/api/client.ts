import { ApiError } from './errors'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

// Browser requests stay same-origin in development so Vite can proxy them.
// This avoids credential and CORS failures when the upstream API is remote.
export const API_BASE_URL = (import.meta.env.DEV ? '/api' : configuredApiBaseUrl).replace(/\/$/, '')

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...init })
  if (!response.ok) throw new ApiError(await responseError(response), response.status)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function responseError(response: Response) {
  if (response.status === 401) return 'Authentication is required for this request.'
  try {
    const body = await response.json() as { detail?: string | Array<{ msg?: string }> }
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) {
      const messages = body.detail.flatMap((item) => item.msg || [])
      if (messages.length) return messages.join('. ')
    }
  } catch {
    // Fall back to the HTTP status when the API does not return JSON.
  }
  return `Request failed (${response.status})`
}
