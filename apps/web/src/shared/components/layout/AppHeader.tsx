import { useEffect, useState, type ReactNode } from 'react'
import { getCategoryDescription, getToolCategories } from '../../../features/tools/catalog'
import type { ConversionTool, ToolCategory } from '../../../features/tools/types'
import { useUi } from '../../context/useUi'
import { GridIcon, HeartIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from '../icons/Icons'
import { ToolFinder } from './ToolFinder'
import { cn, toneClass } from '../../styles'

type Props = {
  authControl: ReactNode
  title: string
  tools: ConversionTool[]
  onMenu: () => void
  onTools: () => void
  onApiDocs: () => void
  onPythonSdk: () => void
  onTypeScriptSdk: () => void
  onCategory: (category: ToolCategory) => void
  onSelect: (tool: ConversionTool) => void
}

export function AppHeader({ authControl, title, tools, onMenu, onTools, onApiDocs, onPythonSdk, onTypeScriptSdk, onCategory, onSelect }: Props) {
  const [finder, setFinder] = useState<'search' | 'favorites' | null>(null)
  const [megaOpen, setMegaOpen] = useState(false)
  const { theme, favorites, toggleTheme } = useUi()
  const categories = getToolCategories(tools).slice(1)

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
    <header className="relative z-40 flex h-[54px] shrink-0 items-center justify-between gap-3.5 rounded-t-[20px] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] py-0 pl-5 pr-3.5 backdrop-blur-2xl max-[860px]:rounded-none max-[860px]:border-b max-[860px]:border-[var(--border)]">
      <div className="flex min-w-0 items-center gap-2.5 text-sm text-[var(--faint)]">
        <button className="hidden size-[38px] cursor-pointer place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] max-[860px]:grid [&_svg]:size-[18px]" type="button" onClick={onMenu} aria-label="Open menu"><MenuIcon /></button>
        <span className="max-[860px]:hidden" aria-hidden="true">⌂</span><span className="text-xl text-[var(--border)] max-[860px]:hidden">›</span><strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text)]">{title}</strong>
      </div>
      <div className="flex items-center gap-[7px] [&_button]:cursor-pointer">
        <button className="flex h-[38px] items-center gap-[9px] rounded-xl border-0 bg-[var(--surface-soft)] px-[13px] text-sm text-[var(--muted)] max-[860px]:hidden [&_svg]:size-4 [&>span]:text-[13px] [&>span]:font-[650] [&>span]:text-[var(--text)] [&>small]:ml-[3px]" type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen((value) => !value)}><GridIcon /><span>Browse tools</span><small>⌄</small></button>
        <button className="flex h-[38px] w-[min(310px,26vw)] items-center gap-[9px] rounded-xl border-0 bg-[var(--surface-soft)] px-[13px] text-left text-sm text-[var(--muted)] max-[860px]:w-[38px] max-[860px]:justify-center max-[860px]:rounded-full max-[860px]:p-0 [&_svg]:size-4 [&>span]:min-w-0 [&>span]:flex-1 max-[860px]:[&>span]:hidden" type="button" aria-label="Search tools" onClick={() => setFinder('search')}><SearchIcon /><span>Search tools…</span><kbd className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 font-sans text-[9px] font-bold text-[var(--accent-text)] max-[860px]:hidden">Ctrl K</kbd></button>
        <button className="grid size-[38px] place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] [&_svg]:size-[18px]" type="button" onClick={toggleTheme} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <SunIcon /> : <MoonIcon />}</button>
        <button className="relative grid size-[38px] place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] [&_svg]:size-[18px]" type="button" onClick={() => setFinder('favorites')} aria-label="Favorite tools"><HeartIcon /><span className="absolute -right-0.5 -top-[3px] grid h-[15px] min-w-[15px] place-items-center rounded-lg bg-[var(--accent)] px-[3px] text-[8px] font-black text-[var(--accent-text)]">{favorites.length}</span></button>
        {authControl}
      </div>
      {megaOpen && <div className="absolute right-3.5 top-[49px] w-[min(900px,calc(100vw-300px))] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--panel-shadow)] max-[860px]:hidden">
        <div className="flex items-end justify-between gap-5 border-b border-[var(--border)] pb-4"><div><strong className="text-[17px]">Explore tools</strong><p className="mb-0 mt-1 text-xs text-[var(--muted)]">Pick a category or jump straight into a converter.</p></div><button className="border-0 bg-transparent text-[11px] font-bold text-[var(--muted)]" type="button" onClick={() => { onTools(); setMegaOpen(false) }}>View all {tools.length} →</button></div>
        <div className="grid grid-cols-5 gap-3 pt-4 max-[1100px]:grid-cols-3 max-[1100px]:[&>section:nth-child(n+4)]:hidden">{categories.map((category) => <section className="min-w-0 rounded-[14px] bg-[var(--surface-soft)] p-2.5" key={category}>
          <button className="flex w-full items-center gap-[9px] border-0 bg-transparent text-left" type="button" onClick={() => { onCategory(category); setMegaOpen(false) }}><span className={cn(toneClass(category), 'ml-1 size-[9px] rounded-[3px] bg-[var(--tone)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--tone)_13%,transparent)]')} /><span><strong className="block text-xs">{category}</strong><small className="mt-0.5 block text-[8px] text-[var(--faint)]">{getCategoryDescription(category, tools)}</small></span></button>
          {tools.filter((tool) => tool.category === category).slice(0, 3).map((tool) => <button className="block w-full overflow-hidden border-0 bg-transparent px-0.5 pt-[9px] text-left text-[10px] text-[var(--muted)] text-ellipsis whitespace-nowrap" type="button" key={tool.id} onClick={() => { onSelect(tool); setMegaOpen(false) }}>{tool.name}</button>)}
        </section>)}</div>
        <div className="mt-3.5 flex items-center gap-[9px] rounded-[14px] bg-[var(--text)] px-3.5 py-3 text-[var(--surface)] [&>span]:min-w-0 [&>span]:flex-1 [&_strong]:block [&_strong]:text-[11px] [&_small]:mt-[3px] [&_small]:block [&_small]:text-[9px] [&_small]:opacity-65 [&>button]:shrink-0 [&>button]:rounded-[9px] [&>button]:border-0 [&>button]:bg-[color-mix(in_srgb,var(--surface)_10%,transparent)] [&>button]:px-[11px] [&>button]:py-2 [&>button]:text-[9px] [&>button]:font-[750] [&>button]:text-inherit"><span><strong>Build with Multiple Tools</strong><small>Use the same conversions from your own product.</small></span><button type="button" onClick={() => { onApiDocs(); setMegaOpen(false) }}>API Key</button><button type="button" onClick={() => { onPythonSdk(); setMegaOpen(false) }}>Python SDK</button><button type="button" onClick={() => { onTypeScriptSdk(); setMegaOpen(false) }}>TypeScript SDK</button></div>
      </div>}
    </header>
    {finder && <ToolFinder tools={tools} favoritesOnly={finder === 'favorites'} onClose={() => setFinder(null)} onSelect={onSelect} />}
  </>
}
