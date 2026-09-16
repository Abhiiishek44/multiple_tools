import { useEffect, useRef, useState } from 'react'
import { LogoutIcon } from '../../../shared/components/icons/Icons'
import { useAuth } from '../context/useAuth'
import { cn } from '../../../shared/styles'

type AuthControlProps = { onLogin: () => void; onSignedOut: () => void }

export function AuthControl({ onLogin, onSignedOut }: AuthControlProps) {
  const { user, status, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
      setMenuOpen(false)
      onSignedOut()
    }
  }

  if (status === 'loading') return <span className="rounded-[10px] bg-[var(--surface-soft)] p-2.5 text-[10px] font-bold text-[var(--muted)] max-[700px]:hidden">Checking…</span>
  if (!user) return <button className="h-[38px] cursor-pointer rounded-lg border border-[var(--text)] bg-[var(--text)] px-4 text-xs font-semibold text-[var(--surface)] transition-colors hover:bg-[var(--accent)] hover:border-[var(--accent)] max-[700px]:w-[38px] max-[700px]:overflow-hidden max-[700px]:px-0 max-[700px]:text-[0px] max-[700px]:before:text-[15px] max-[700px]:before:content-['↪']" type="button" onClick={onLogin}>Log in</button>

  return <div className="relative" ref={menuRef}>
    <button className="flex h-[38px] cursor-pointer items-center gap-[7px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] py-[3px] pl-[3px] pr-[9px] max-[700px]:w-[38px] max-[700px]:p-[3px]" type="button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
      {user.picture_url ? <img className="grid size-[30px] place-items-center rounded-full bg-[var(--accent)] text-[11px] font-extrabold text-[var(--accent-text)]" src={user.picture_url} alt="" referrerPolicy="no-referrer" /> : <span className="grid size-[30px] place-items-center rounded-full bg-[var(--accent)] text-[11px] font-extrabold text-[var(--accent-text)]">{user.name.slice(0, 1).toUpperCase()}</span>}
      <strong className="max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] max-[700px]:hidden">{user.name}</strong>
    </button>
    {menuOpen && <div className="absolute right-0 top-[calc(100%_+_9px)] z-60 w-[230px] overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--panel-shadow)]" role="menu">
      <div className="border-b border-[var(--border)] px-[15px] pb-3 pt-3.5">
        <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs">{user.name}</strong>
        <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--muted)]">{user.email}</span>
      </div>
      <button className={cn('flex min-h-[43px] w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-[15px] text-left text-xs font-bold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] disabled:cursor-wait disabled:opacity-55 [&_svg]:size-[17px]')} type="button" role="menuitem" disabled={signingOut} onClick={() => void handleSignOut()}>
        <LogoutIcon />
        <span>{signingOut ? 'Logging out…' : 'Log out'}</span>
      </button>
    </div>}
  </div>
}
