import { apiRequest } from '../../shared/api/client'
import type { LoveStatus } from './types'

export function getLoveStatus() {
  return apiRequest<LoveStatus>('/v1/love')
}

export function sendLove() {
  return apiRequest<LoveStatus>('/v1/love', { method: 'POST' })
}
