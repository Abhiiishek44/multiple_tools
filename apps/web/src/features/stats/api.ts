import { apiRequest } from '../../shared/api/client'
import type { PublicStats } from './types'

export function getPublicStats() {
  return apiRequest<PublicStats>('/v1/stats/public')
}
