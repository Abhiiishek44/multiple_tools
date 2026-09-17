import { useState } from 'react'
import { useAuth } from '../../../features/auth/context/useAuth'
import type { ConversionTool } from '../../../features/tools/types'
import { CodeIcon, GridIcon, KeyIcon, LogoutIcon, SidebarToggleIcon, SparklesIcon, TerminalIcon } from '../icons/Icons'
import { BrandLogo } from '../brand/BrandLogo'
import { cn } from '../../styles'

type Props = {
  mobileOpen: boolean
  collapsed: boolean
  tools: ConversionTool[]
  active: string
  onClose: () => void
  onCollapse: () => void
  onHome: () => void
  onAiSummarizer: () => void
  onApiDocs: () => void
  onPythonSdk: () => void
  onTypeScriptSdk: () => void
}

export function AppSidebar({ mobileOpen, collapsed, tools, active, onClose, onCollapse, onHome, onAiSummarizer, onApiDocs, onPythonSdk, onTypeScriptSdk }: Props) {
  const { user, status, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const navButton = (selected: boolean) => cn(
    'grid min-h-[43px] cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-transparent bg-transparent px-3 text-left text-sm text-[var(--muted)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] [&>svg]:size-[18px] [&>small]:text-[11px] [&>small]:text-[var(--faint)]',
    selected && 'bg-[var(--surface-strong)] font-bold text-[var(--text)]',
    collapsed && 'grid-cols-1 justify-items-center px-0 max-[860px]:grid-cols-[20px_minmax(0,1fr)_auto] max-[860px]:justify-items-stretch max-[860px]:px-3',
  )

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
    <button className={cn('pointer-events-none fixed inset-0 z-49 hidden border-0 bg-black/45 opacity-0 transition-opacity max-[860px]:block', mobileOpen && 'pointer-events-auto opacity-100')} type="button" aria-label="Close menu" tabIndex={mobileOpen ? 0 : -1} aria-hidden={!mobileOpen} onClick={onClose} />
    <aside className={cn('relative z-50 flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-[var(--surface)] px-4 py-[18px] transition-[padding,transform] duration-250 max-[860px]:fixed max-[860px]:inset-y-2 max-[860px]:left-2 max-[860px]:h-auto max-[860px]:max-h-[calc(100vh_-_16px)] max-[860px]:w-[min(280px,calc(100vw_-_36px))] max-[860px]:-translate-x-[calc(100%_+_18px)] max-[860px]:overflow-y-auto max-[860px]:shadow-[var(--panel-shadow)]', mobileOpen && 'max-[860px]:translate-x-0', collapsed && 'px-2.5 max-[860px]:px-4')}>
      <div className={cn('flex min-h-10 items-center justify-between gap-2', collapsed && 'flex-col justify-center gap-2.5 max-[860px]:flex-row max-[860px]:justify-between')}>
        <button className={cn('flex min-w-0 cursor-pointer items-center border-0 bg-transparent p-0', !collapsed && 'flex-1')} type="button" onClick={onHome} aria-label="LoveMyDocument home"><BrandLogo iconOnly={collapsed} /></button>
        <button className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] max-[860px]:hidden [&_svg]:size-[17px]" type="button" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'} title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}><SidebarToggleIcon expanded={!collapsed} /></button>
      </div>
      <nav className="mt-[26px] flex flex-col gap-[5px]" aria-label="Primary navigation">
        <button className={navButton(active === 'tools' || active === 'home')} type="button" title={collapsed ? 'Tools' : undefined} onClick={() => { onHome(); onClose() }}><GridIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>Tools</span><small className={cn(collapsed && 'hidden max-[860px]:inline')}>{tools.length}</small></button>
        <button className={navButton(active === 'ai-summarizer')} type="button" title={collapsed ? 'AI Summarizer' : undefined} onClick={() => { onAiSummarizer(); onClose() }}><SparklesIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>AI Summarizer</span></button>
        <p className={cn('mx-2.5 mb-[7px] mt-[22px] text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]', collapsed && 'hidden max-[860px]:block')}>Integrations</p>
        <div className={cn('min-h-2', collapsed && 'hidden max-[860px]:block')} aria-label="Integrations" />
        <p className={cn('mx-2.5 mb-[7px] mt-[18px] text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]', collapsed && 'hidden max-[860px]:block')}>Automations</p>
        <div className={cn('min-h-2', collapsed && 'hidden max-[860px]:block')} aria-label="Automations" />
        <p className={cn('mx-2.5 mb-[7px] mt-[22px] text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]', collapsed && 'hidden max-[860px]:block')}>Developers</p>
        <button className={navButton(active === 'api')} type="button" title={collapsed ? 'API Key' : undefined} onClick={() => { onApiDocs(); onClose() }}><KeyIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>API Key</span></button>
        <button className={navButton(active === 'python-sdk')} type="button" title={collapsed ? 'Python SDK' : undefined} onClick={() => { onPythonSdk(); onClose() }}><TerminalIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>Python SDK</span></button>
        <button className={navButton(active === 'typescript-sdk')} type="button" title={collapsed ? 'TypeScript SDK' : undefined} onClick={() => { onTypeScriptSdk(); onClose() }}><CodeIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>TypeScript SDK</span></button>
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        {status === 'authenticated' && user && <div className={cn('overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]', collapsed && 'border-0 bg-transparent max-[860px]:border max-[860px]:bg-[var(--surface-soft)]')}>
          <div className={cn('flex items-center gap-2.5 p-2.5', collapsed && 'justify-center p-0 max-[860px]:justify-start max-[860px]:p-2.5')}>
            {user.picture_url ? <img className="size-8 shrink-0 rounded-lg object-cover" src={user.picture_url} alt="" referrerPolicy="no-referrer" /> : <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>}
            <span className={cn('min-w-0 flex-1', collapsed && 'hidden max-[860px]:block')}><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[var(--text)]">{user.name}</strong><small className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-[var(--muted)]">{user.email}</small></span>
          </div>
          <button className={cn('flex min-h-9 w-full cursor-pointer items-center gap-2 border-0 border-t border-[var(--border)] bg-transparent px-2.5 text-left text-[11px] font-semibold text-[var(--danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] disabled:cursor-wait disabled:opacity-55 [&_svg]:size-3.5 [&_svg]:shrink-0', collapsed && 'hidden max-[860px]:flex')} type="button" disabled={signingOut} aria-label="Log out" onClick={() => void logout()}><LogoutIcon /><span>{signingOut ? 'Logging out…' : 'Log out'}</span></button>
        </div>}
      </div>
    </aside>
  </>
}
