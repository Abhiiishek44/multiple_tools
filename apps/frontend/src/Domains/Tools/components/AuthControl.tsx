import { useEffect, useRef } from 'react'
import { API_BASE_URL, type AuthenticatedUser } from '../api/conversion'

type GoogleAccounts = {
  id: {
    initialize: (options: { client_id: string; ux_mode: 'redirect'; login_uri: string }) => void
    renderButton: (element: HTMLElement, options: Record<string, string>) => void
  }
}

declare global {
  interface Window { google?: { accounts: GoogleAccounts } }
}

type AuthControlProps = {
  user: AuthenticatedUser | null
  onLogout: () => void
}

export function AuthControl({ user, onLogout }: AuthControlProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    if (user || !clientId || !buttonRef.current) return

    const render = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({ client_id: clientId, ux_mode: 'redirect', login_uri: `${API_BASE_URL}/v1/auth/google/callback` })
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'medium', shape: 'pill', text: 'signin_with' })
    }

    const existing = document.querySelector<HTMLScriptElement>('#google-identity-services')
    if (existing) {
      if (window.google) render()
      else existing.addEventListener('load', render, { once: true })
      return () => existing.removeEventListener('load', render)
    }

    const script = document.createElement('script')
    script.id = 'google-identity-services'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.addEventListener('load', render, { once: true })
    document.head.appendChild(script)
    return () => script.removeEventListener('load', render)
  }, [clientId, user])

  if (user) {
    return (
      <button className="user-chip" type="button" onClick={onLogout} title="Sign out">
        {user.picture_url ? <img src={user.picture_url} alt="" referrerPolicy="no-referrer" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
        <strong>{user.name}</strong>
      </button>
    )
  }

  if (!clientId) return <span className="auth-config-note" title="Add VITE_GOOGLE_CLIENT_ID to your .env file">Sign-in setup required</span>
  return <div className="google-sign-in" ref={buttonRef} />
}
