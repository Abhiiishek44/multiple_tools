import { useAuth } from '../context/useAuth'

type AuthControlProps = { onLogin: () => void; onSignedOut: () => void }

export function AuthControl({ onLogin, onSignedOut }: AuthControlProps) {
  const { user, status, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      onSignedOut()
    }
  }

  if (status === 'loading') return <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">Checking session…</span>
  if (!user) return <button className="min-h-10 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="button" onClick={onLogin}>Log in</button>

  return (
    <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-slate-800 shadow-sm transition hover:border-blue-300" type="button" onClick={() => void handleSignOut()} title="Sign out">
      {user.picture_url ? <img className="size-8 rounded-full" src={user.picture_url} alt="" referrerPolicy="no-referrer" /> : <span className="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-extrabold text-white">{user.name.slice(0, 1).toUpperCase()}</span>}
      <strong className="hidden max-w-28 truncate text-xs sm:block">{user.name}</strong>
    </button>
  )
}
