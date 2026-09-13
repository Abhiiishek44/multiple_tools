import { apiRequest } from '../../shared/api/client'

export type ApiKeyRecord = {
  key_id: string
  name: string
  scopes: string[]
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
}

export type CreatedApiKey = ApiKeyRecord & { api_key: string }

export function listApiKeys() {
  return apiRequest<ApiKeyRecord[]>('/v1/api-keys')
}

export function createApiKey(name: string, scopes: string[]) {
  return apiRequest<CreatedApiKey>('/v1/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, scopes }),
  })
}

export function revokeApiKey(keyId: string) {
  return apiRequest<void>(`/v1/api-keys/${encodeURIComponent(keyId)}`, { method: 'DELETE' })
}
