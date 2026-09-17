import { useState } from 'react'
import { useAuth } from '../../../features/auth/context/useAuth'
import { getToolCategories } from '../../../features/tools/catalog'
import type { ConversionTool, ToolCategory } from '../../../features/tools/types'
import { BrandIcon, CodeIcon, GridIcon, HomeIcon, KeyIcon, LogoutIcon, TerminalIcon } from '../icons/Icons'
import { cn, toneClass } from '../../styles'

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
  onTypeScriptSdk: () => void
  onCategory: (category: ToolCategory) => void
}

export function AppSidebar({ mobileOpen, collapsed, tools, active, onClose, onCollapse, onHome, onTools, onApiDocs, onPythonSdk, onTypeScriptSdk, onCategory }: Props) {
  const { status, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const categories = getToolCategories(tools).slice(1)
  const navButton = (selected: boolean) => cn(
    'grid min-h-[43px] cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[13px] border-0 bg-transparent px-3 text-left text-sm text-[var(--muted)] transition hover:translate-x-0.5 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] [&>svg]:size-[18px] [&>small]:text-[11px] [&>small]:text-[var(--faint)]',
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
      <div className={cn('flex min-h-[38px] items-center justify-between gap-1.5', collapsed && 'flex-col justify-center gap-2.5 max-[860px]:flex-row max-[860px]:justify-between')}>
        <button className={cn('flex min-w-0 cursor-pointer items-center gap-2.5 border-0 bg-transparent text-[17px]', collapsed && 'gap-0 max-[860px]:gap-2.5')} type="button" onClick={onHome} aria-label="Multiple Tools home"><span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:size-[21px] [&_svg]:stroke-2"><BrandIcon /></span><strong className={cn('overflow-hidden whitespace-nowrap font-extrabold tracking-[-.03em]', collapsed && 'hidden max-[860px]:block')}>Multiple Tools</strong></button>
        <button className={cn('grid size-7 cursor-pointer place-items-center rounded-[9px] border border-[var(--border)] bg-[var(--surface-soft)] text-xl text-[var(--muted)] max-[860px]:hidden', collapsed && 'rotate-180')} type="button" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>‹</button>
      </div>
      <nav className="mt-[26px] flex flex-col gap-[5px]" aria-label="Primary navigation">
        <button className={navButton(active === 'home')} type="button" title={collapsed ? 'Home' : undefined} onClick={() => { onHome(); onClose() }}><HomeIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>Home</span></button>
        <button className={navButton(active === 'tools')} type="button" title={collapsed ? 'All tools' : undefined} onClick={() => { onTools(); onClose() }}><GridIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>All tools</span><small className={cn(collapsed && 'hidden max-[860px]:inline')}>{tools.length}</small></button>
        <p className={cn('mx-2.5 mb-[7px] mt-[22px] text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]', collapsed && 'hidden max-[860px]:block')}>Categories</p>
        {categories.map((category) => <button className={navButton(active === category)} type="button" key={category} title={collapsed ? category : undefined} onClick={() => { onCategory(category); onClose() }}><span className={cn(toneClass(category), 'ml-1 size-[9px] rounded-[3px] bg-[var(--tone)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--tone)_13%,transparent)]', collapsed && 'ml-0 max-[860px]:ml-1')} /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>{category}</span><small className={cn(collapsed && 'hidden max-[860px]:inline')}>{tools.filter((tool) => tool.category === category).length}</small></button>)}
        <p className={cn('mx-2.5 mb-[7px] mt-[22px] text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]', collapsed && 'hidden max-[860px]:block')}>Developers</p>
        <button className={navButton(active === 'api')} type="button" title={collapsed ? 'API Key' : undefined} onClick={() => { onApiDocs(); onClose() }}><KeyIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>API Key</span></button>
        <button className={navButton(active === 'python-sdk')} type="button" title={collapsed ? 'Python SDK' : undefined} onClick={() => { onPythonSdk(); onClose() }}><TerminalIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>Python SDK</span></button>
        <button className={navButton(active === 'typescript-sdk')} type="button" title={collapsed ? 'TypeScript SDK' : undefined} onClick={() => { onTypeScriptSdk(); onClose() }}><CodeIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>TypeScript SDK</span></button>
      </nav>
      {status === 'authenticated' && <button className={cn('mt-auto flex min-h-[43px] w-full cursor-pointer items-center gap-2.5 rounded-[13px] border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-left text-sm font-[650] text-[var(--muted)] transition hover:border-[color-mix(in_srgb,var(--danger)_32%,var(--border))] hover:bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] hover:text-[var(--danger)] disabled:cursor-wait disabled:opacity-55 [&_svg]:size-[18px] [&_svg]:shrink-0', collapsed && 'justify-center px-0 max-[860px]:justify-start max-[860px]:px-3')} type="button" disabled={signingOut} title={collapsed ? 'Log out' : undefined} aria-label="Log out" onClick={() => void logout()}><LogoutIcon /><span className={cn(collapsed && 'hidden max-[860px]:inline')}>{signingOut ? 'Logging out…' : 'Log out'}</span></button>}
    </aside>
  </>
}
