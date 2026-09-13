import { useEffect, useRef, useState } from 'react'
import { LogoutIcon } from '../../../shared/components/icons/Icons'
import { useAuth } from '../context/useAuth'

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

  if (status === 'loading') return <span className="auth-loading">Checking…</span>
  if (!user) return <button className="login-button" type="button" onClick={onLogin}>Log in</button>

  return <div className="account-control" ref={menuRef}>
    <button className="user-button" type="button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
      {user.picture_url ? <img src={user.picture_url} alt="" referrerPolicy="no-referrer" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
      <strong>{user.name}</strong>
    </button>
    {menuOpen && <div className="account-menu" role="menu">
      <div className="account-menu-user">
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
      <button type="button" role="menuitem" disabled={signingOut} onClick={() => void handleSignOut()}>
        <LogoutIcon />
        <span>{signingOut ? 'Logging out…' : 'Log out'}</span>
      </button>
    </div>}
  </div>
}
