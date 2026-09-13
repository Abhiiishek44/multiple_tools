import { useState } from 'react'
import { useAuth } from '../../../features/auth/context/useAuth'
import { TOOL_CATEGORIES, type ConversionTool, type ToolCategory } from '../../../features/tools/types'
import { BrandIcon, GridIcon, HomeIcon, KeyIcon, LogoutIcon, TerminalIcon } from '../icons/Icons'

type Props = {
  mobileOpen: boolean
  collapsed: boolean
  tools: ConversionTool[]
  active: string
  onClose: () => void
  onCollapse: () => void
  onHome: () => void
  onTools: () => void
  onApiDocs: () => void
  onPythonSdk: () => void
  onCategory: (category: ToolCategory) => void
}

export function AppSidebar({ mobileOpen, collapsed, tools, active, onClose, onCollapse, onHome, onTools, onApiDocs, onPythonSdk, onCategory }: Props) {
  const { status, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const logout = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
      onClose()
      onHome()
    }
  }

  return <>
    <button className={`sidebar-scrim ${mobileOpen ? 'is-open' : ''}`} type="button" aria-label="Close menu" tabIndex={mobileOpen ? 0 : -1} aria-hidden={!mobileOpen} onClick={onClose} />
    <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <button type="button" onClick={onHome} aria-label="Multiple Tools home"><span className="brand-mark"><BrandIcon /></span><strong>Multiple Tools</strong></button>
        <button className="collapse-button" type="button" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>‹</button>
      </div>
      <nav aria-label="Primary navigation">
        <button className={active === 'home' ? 'active' : ''} type="button" title={collapsed ? 'Home' : undefined} onClick={() => { onHome(); onClose() }}><HomeIcon /><span>Home</span></button>
        <button className={active === 'tools' ? 'active' : ''} type="button" title={collapsed ? 'All tools' : undefined} onClick={() => { onTools(); onClose() }}><GridIcon /><span>All tools</span><small>{tools.length}</small></button>
        <p className="sidebar-label">Categories</p>
        {TOOL_CATEGORIES.slice(1).map((category) => <button className={active === category ? 'active' : ''} type="button" key={category} title={collapsed ? category : undefined} onClick={() => { onCategory(category); onClose() }}><span className={`nav-color tone-${category.toLowerCase()}`} /><span>{category}</span><small>{tools.filter((tool) => tool.category === category).length}</small></button>)}
        <p className="sidebar-label">Developers</p>
        <button className={active === 'api' ? 'active' : ''} type="button" title={collapsed ? 'API Key' : undefined} onClick={() => { onApiDocs(); onClose() }}><KeyIcon /><span>API Key</span></button>
        <button className={active === 'sdk' ? 'active' : ''} type="button" title={collapsed ? 'Python SDK' : undefined} onClick={() => { onPythonSdk(); onClose() }}><TerminalIcon /><span>Python SDK</span></button>
      </nav>
      {status === 'authenticated' && <button className="sidebar-logout" type="button" disabled={signingOut} title={collapsed ? 'Log out' : undefined} aria-label="Log out" onClick={() => void logout()}><LogoutIcon /><span>{signingOut ? 'Logging out…' : 'Log out'}</span></button>}
    </aside>
  </>
}
