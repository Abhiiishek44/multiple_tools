import { useEffect, useState } from 'react'
import { API_BASE_URL, apiRequest } from '../../../shared/api/client'

type State = 'checking' | 'online' | 'offline'

export function ApiStatus() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    let active = true
    void apiRequest<unknown>('/health').then(() => { if (active) setState('online') }).catch(() => { if (active) setState('offline') })
    return () => { active = false }
  }, [])

  return <div className="api-status"><span className={`status-dot status-${state}`} /><div><small>Configured API</small><strong>{API_BASE_URL}</strong></div><span>{state === 'checking' ? 'Checking…' : state === 'online' ? 'Operational' : 'Unavailable'}</span></div>
}
