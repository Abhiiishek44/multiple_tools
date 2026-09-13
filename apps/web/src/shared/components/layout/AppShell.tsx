import { useState, type ReactNode } from 'react'
import type { ConversionTool, ToolCategory } from '../../../features/tools/types'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

type Props = { children: ReactNode; authControl: ReactNode; title: string; active: string; tools: ConversionTool[]; onHome: () => void; onTools: () => void; onApiDocs: () => void; onPythonSdk: () => void; onCategory: (category: ToolCategory) => void; onSelect: (tool: ConversionTool) => void }

export function AppShell(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}><AppSidebar mobileOpen={mobileOpen} collapsed={collapsed} tools={props.tools} active={props.active} onClose={() => setMobileOpen(false)} onCollapse={() => setCollapsed((value) => !value)} onHome={props.onHome} onTools={props.onTools} onApiDocs={props.onApiDocs} onPythonSdk={props.onPythonSdk} onCategory={props.onCategory} /><div className="app-stage"><AppHeader authControl={props.authControl} title={props.title} tools={props.tools} onMenu={() => setMobileOpen(true)} onTools={props.onTools} onApiDocs={props.onApiDocs} onPythonSdk={props.onPythonSdk} onCategory={props.onCategory} onSelect={props.onSelect} /><div className="app-content">{props.children}</div></div></div>
}
