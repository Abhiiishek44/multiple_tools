import { createContext } from 'react'
import type { AuthenticatedUser, AuthStatus } from '../types'

export type AuthContextValue = {
  user: AuthenticatedUser | null
  status: AuthStatus
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
  invalidateSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
