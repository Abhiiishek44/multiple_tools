import { useState, type ReactNode } from 'react'
import type { ConversionTool } from '../../../features/tools/types'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { cn, focusDefaults, iconDefaults, themeTokens } from '../../styles'

type Props = { children: ReactNode; authControl: ReactNode; title: string; breadcrumbs: { label: string; onClick?: () => void }[]; active: string; tools: ConversionTool[]; onHome: () => void; onApiDocs: () => void; onPythonSdk: () => void; onTypeScriptSdk: () => void; onSelect: (tool: ConversionTool) => void }

export function AppShell(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className={cn(themeTokens, iconDefaults, focusDefaults, 'grid h-dvh min-h-0 w-full min-w-80 gap-2 overflow-hidden bg-[var(--canvas)] p-2 font-sans text-[var(--text)] transition-[grid-template-columns] duration-250 max-[860px]:block max-[860px]:p-0', collapsed ? 'grid-cols-[80px_minmax(0,1fr)]' : 'grid-cols-[270px_minmax(0,1fr)]')}><AppSidebar mobileOpen={mobileOpen} collapsed={collapsed} tools={props.tools} active={props.active} onClose={() => setMobileOpen(false)} onCollapse={() => setCollapsed((value) => !value)} onHome={props.onHome} onApiDocs={props.onApiDocs} onPythonSdk={props.onPythonSdk} onTypeScriptSdk={props.onTypeScriptSdk} /><div className="flex min-h-0 min-w-0 flex-col overflow-hidden max-[860px]:h-full max-[860px]:w-full"><AppHeader authControl={props.authControl} title={props.title} breadcrumbs={props.breadcrumbs} tools={props.tools} onMenu={() => setMobileOpen(true)} onSelect={props.onSelect} /><div data-scroll-container className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain rounded-b-[22px] bg-[var(--surface)] [scrollbar-color:color-mix(in_srgb,var(--muted)_48%,transparent)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] max-[860px]:rounded-none">{props.children}</div></div></div>
}
