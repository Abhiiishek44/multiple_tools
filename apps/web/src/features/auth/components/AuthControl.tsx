import { useAuth } from '../context/useAuth'

type AuthControlProps = { onLogin: () => void; onSignedOut: () => void }

export function AuthControl({ onLogin, onSignedOut }: AuthControlProps) {
  const { user, status } = useAuth()
  void onSignedOut

  if (status === 'loading') return <span className="rounded-[10px] bg-[var(--surface-soft)] p-2.5 text-[10px] font-bold text-[var(--muted)] max-[700px]:hidden">Checking…</span>
  if (!user) return <button className="h-[38px] cursor-pointer rounded-lg border border-[var(--text)] bg-[var(--text)] px-4 text-xs font-semibold text-[var(--surface)] transition-colors hover:bg-[var(--accent)] hover:border-[var(--accent)] max-[700px]:w-[38px] max-[700px]:overflow-hidden max-[700px]:px-0 max-[700px]:text-[0px] max-[700px]:before:text-[15px] max-[700px]:before:content-['↪']" type="button" onClick={onLogin}>Log in</button>

  return null
}
