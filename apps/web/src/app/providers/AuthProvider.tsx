import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, logout } from '../../features/auth/api'
import { AuthContext, type AuthContextValue } from '../../features/auth/context/AuthContext'
import type { AuthenticatedUser, AuthStatus } from '../../features/auth/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const invalidateSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  const refreshSession = useCallback(async () => {
    setStatus('loading')
    try {
      setUser(await getCurrentUser())
      setStatus('authenticated')
    } catch {
      invalidateSession()
    }
  }, [invalidateSession])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      invalidateSession()
    }
  }, [invalidateSession])

  useEffect(() => {
    let active = true
    void getCurrentUser().then((authenticatedUser) => {
      if (!active) return
      setUser(authenticatedUser)
      setStatus('authenticated')
    }).catch(() => {
      if (active) invalidateSession()
    })
    return () => { active = false }
  }, [invalidateSession])

  const value = useMemo<AuthContextValue>(() => ({ user, status, refreshSession, signOut, invalidateSession }), [invalidateSession, refreshSession, signOut, status, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
