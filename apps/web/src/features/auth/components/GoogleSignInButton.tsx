import { useEffect, useRef, useState } from 'react'
import { completeGoogleSignIn } from '../api'

type CredentialResponse = { credential?: string }
type GoogleAccounts = { id: { initialize: (options: { client_id: string; ux_mode: 'popup'; callback: (response: CredentialResponse) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string>) => void } }

declare global { interface Window { google?: { accounts: GoogleAccounts } } }

export function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'signing-in'>('loading')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    if (!clientId || !buttonRef.current) return
    const handleCredential = async (response: CredentialResponse) => {
      if (!response.credential) {
        setError('Google did not return a sign-in credential. Please try again.')
        return
      }
      setError(null)
      setPhase('signing-in')
      try {
        await completeGoogleSignIn(response.credential)
        window.location.assign('/dashboard')
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Could not sign in with Google.')
        setPhase('ready')
      }
    }
    const render = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({ client_id: clientId, ux_mode: 'popup', callback: (response) => void handleCredential(response) })
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with', width: '320' })
      setPhase('ready')
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
    script.addEventListener('error', () => { setError('Could not load Google sign-in. Check your connection and try again.'); setPhase('ready') }, { once: true })
    document.head.appendChild(script)
    return () => script.removeEventListener('load', render)
  }, [clientId])

  if (!clientId) return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Google login is not configured. Add <strong>VITE_GOOGLE_CLIENT_ID</strong> to the frontend environment.</div>
  return <><div className="relative mx-auto min-h-11 w-full max-w-[320px]"><div className={phase === 'signing-in' ? 'pointer-events-none opacity-40' : ''} ref={buttonRef} />{phase !== 'ready' && <div className="absolute inset-0 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[13px] font-semibold text-[var(--text)]" role="status"><span className="size-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" aria-hidden="true" />{phase === 'signing-in' ? 'Signing you in…' : 'Loading Google…'}</div>}</div>{error && <p className="mb-0 mt-3 text-xs leading-[1.5] text-[var(--danger)]" role="alert">{error}</p>}</>
}
