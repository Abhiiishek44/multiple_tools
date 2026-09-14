import { useEffect, useState } from 'react'
import { API_BASE_URL, apiRequest } from '../../../shared/api/client'
import { cn } from '../../../shared/styles'

type State = 'checking' | 'online' | 'offline'

export function ApiStatus() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    let active = true
    void apiRequest<unknown>('/health').then(() => { if (active) setState('online') }).catch(() => { if (active) setState('offline') })
    return () => { active = false }
  }, [])

  return <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[13px] bg-[var(--surface)] p-3"><span className={cn('size-[9px] rounded-full bg-[var(--faint)]', state === 'online' && 'bg-[#24b36b] shadow-[0_0_0_5px_color-mix(in_srgb,#24b36b_12%,transparent)]', state === 'offline' && 'bg-[var(--danger)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--danger)_12%,transparent)]', state === 'checking' && 'animate-pulse')} /><div className="min-w-0"><small className="block text-[8px] uppercase tracking-[.08em] text-[var(--faint)]">Configured API</small><strong className="mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">{API_BASE_URL}</strong></div><span className="text-[10px] font-bold text-[var(--muted)]">{state === 'checking' ? 'Checking…' : state === 'online' ? 'Operational' : 'Unavailable'}</span></div>
}
