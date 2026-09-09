import { useEffect, useRef } from 'react'
import { API_BASE_URL } from '../../../shared/api/client'

type GoogleAccounts = { id: { initialize: (options: { client_id: string; ux_mode: 'redirect'; login_uri: string }) => void; renderButton: (element: HTMLElement, options: Record<string, string>) => void } }

declare global { interface Window { google?: { accounts: GoogleAccounts } } }

export function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    if (!clientId || !buttonRef.current) return
    const render = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({ client_id: clientId, ux_mode: 'redirect', login_uri: `${API_BASE_URL}/v1/auth/google/callback` })
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: '320' })
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
  }, [clientId])

  if (!clientId) return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Google login is not configured. Add <strong>VITE_GOOGLE_CLIENT_ID</strong> to the frontend environment.</div>
  return <div className="grid min-h-11 place-items-center" ref={buttonRef} />
}
