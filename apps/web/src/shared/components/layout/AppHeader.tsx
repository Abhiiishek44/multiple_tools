import { useEffect, useState, type ReactNode } from 'react'
import { CATEGORY_DETAILS } from '../../../features/tools/catalog'
import { TOOL_CATEGORIES, type ConversionTool, type ToolCategory } from '../../../features/tools/types'
import { useUi } from '../../context/useUi'
import { GridIcon, HeartIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from '../icons/Icons'
import { ToolFinder } from './ToolFinder'

type Props = {
  authControl: ReactNode
  title: string
  tools: ConversionTool[]
  onMenu: () => void
  onTools: () => void
  onApiDocs: () => void
  onPythonSdk: () => void
  onCategory: (category: ToolCategory) => void
  onSelect: (tool: ConversionTool) => void
}

export function AppHeader({ authControl, title, tools, onMenu, onTools, onApiDocs, onPythonSdk, onCategory, onSelect }: Props) {
  const [finder, setFinder] = useState<'search' | 'favorites' | null>(null)
  const [megaOpen, setMegaOpen] = useState(false)
  const { theme, favorites, toggleTheme } = useUi()

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setFinder('search')
      }
    }
    window.addEventListener('keydown', openSearch)
    return () => window.removeEventListener('keydown', openSearch)
  }, [])

  return <>
    <header className="app-header">
      <div className="header-crumb">
        <button className="mobile-menu" type="button" onClick={onMenu} aria-label="Open menu"><MenuIcon /></button>
        <span aria-hidden="true">⌂</span><span className="crumb-chevron">›</span><strong>{title}</strong>
      </div>
      <div className="header-actions">
        <button className="browse-button" type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen((value) => !value)}><GridIcon /><span>Browse tools</span><small>⌄</small></button>
        <button className="header-search" type="button" aria-label="Search tools" onClick={() => setFinder('search')}><SearchIcon /><span>Search tools…</span><kbd>Ctrl K</kbd></button>
        <button className="icon-button" type="button" onClick={toggleTheme} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <SunIcon /> : <MoonIcon />}</button>
        <button className="icon-button favorite-control" type="button" onClick={() => setFinder('favorites')} aria-label="Favorite tools"><HeartIcon /><span>{favorites.length}</span></button>
        {authControl}
      </div>
      {megaOpen && <div className="mega-menu">
        <div className="mega-heading"><div><strong>Explore tools</strong><p>Pick a category or jump straight into a converter.</p></div><button type="button" onClick={() => { onTools(); setMegaOpen(false) }}>View all {tools.length} →</button></div>
        <div className="mega-grid">{TOOL_CATEGORIES.slice(1).map((category) => <section key={category}>
          <button type="button" onClick={() => { onCategory(category); setMegaOpen(false) }}><span className={`nav-color tone-${category.toLowerCase()}`} /><span><strong>{category}</strong><small>{CATEGORY_DETAILS[category].description}</small></span></button>
          {tools.filter((tool) => tool.category === category).slice(0, 3).map((tool) => <button className="mega-tool" type="button" key={tool.id} onClick={() => { onSelect(tool); setMegaOpen(false) }}>{tool.name}</button>)}
        </section>)}</div>
        <div className="mega-developers"><span><strong>Build with Multiple Tools</strong><small>Use the same conversions from your own product.</small></span><button type="button" onClick={() => { onApiDocs(); setMegaOpen(false) }}>API Key</button><button type="button" onClick={() => { onPythonSdk(); setMegaOpen(false) }}>Python SDK</button></div>
      </div>}
    </header>
    {finder && <ToolFinder tools={tools} favoritesOnly={finder === 'favorites'} onClose={() => setFinder(null)} onSelect={onSelect} />}
  </>
}
