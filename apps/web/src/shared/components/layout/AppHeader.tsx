import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ConversionTool } from '../../../features/tools/types'
import { useUi } from '../../context/useUi'
import { HeartIcon, MenuIcon, MoonIcon, SunIcon } from '../icons/Icons'
import { FavoritesDropdown } from './FavoritesDropdown'
import { cn } from '../../styles'

type Props = {
  authControl: ReactNode
  title: string
  breadcrumbs: { label: string; onClick?: () => void }[]
  tools: ConversionTool[]
  onMenu: () => void
  onSelect: (tool: ConversionTool) => void
}

export function AppHeader({ authControl, title, breadcrumbs, tools, onMenu, onSelect }: Props) {
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const favoritesRef = useRef<HTMLDivElement>(null)
  const { theme, favorites, toggleTheme } = useUi()

  useEffect(() => {
    if (!favoritesOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => { if (!favoritesRef.current?.contains(event.target as Node)) setFavoritesOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFavoritesOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnOutsideClick); window.removeEventListener('keydown', closeOnEscape) }
  }, [favoritesOpen])

  return <>
    <header className="relative z-40 flex h-[54px] shrink-0 items-center justify-between gap-3.5 rounded-t-[20px] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] py-0 pl-5 pr-3.5 backdrop-blur-2xl max-[860px]:rounded-none max-[860px]:border-b max-[860px]:border-[var(--border)]">
      <nav className="flex min-w-0 items-center gap-2 text-sm text-[var(--faint)]" aria-label="Breadcrumb">
        <button className="hidden size-[38px] cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-soft)] max-[860px]:grid [&_svg]:size-[18px]" type="button" onClick={onMenu} aria-label="Open menu"><MenuIcon /></button>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden max-[700px]:hidden">{breadcrumbs.map((crumb, index) => <span className="flex min-w-0 items-center gap-2" key={`${crumb.label}-${index}`}>{index > 0 && <span className="text-xl text-[var(--border)]" aria-hidden="true">›</span>}{crumb.onClick ? <button className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap border-0 bg-transparent p-0 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--text)]" type="button" onClick={crumb.onClick}>{crumb.label}</button> : <strong className="max-w-44 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text)]">{crumb.label}</strong>}</span>)}</div>
        <strong className="hidden overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text)] max-[700px]:block">{title}</strong>
      </nav>
      <div className="flex items-center gap-[7px] [&_button]:cursor-pointer">
        <button className="grid size-[38px] place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-soft)] [&_svg]:size-[18px]" type="button" onClick={toggleTheme} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <SunIcon /> : <MoonIcon />}</button>
        <div className="relative" ref={favoritesRef}><button className={cn('relative grid size-[38px] place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-soft)] [&_svg]:size-[18px]', favorites.length > 0 && 'text-[#f05252]')} type="button" onClick={() => setFavoritesOpen((open) => !open)} aria-expanded={favoritesOpen} aria-haspopup="dialog" aria-label={`Favorites${favorites.length ? ` (${favorites.length})` : ''}`}><HeartIcon filled={favorites.length > 0} />{favorites.length > 0 && <small className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[var(--accent)] text-[8px] font-bold text-[var(--accent-text)]">{favorites.length}</small>}</button>{favoritesOpen && <FavoritesDropdown tools={tools} favoriteIds={favorites} onClose={() => setFavoritesOpen(false)} onSelect={onSelect} />}</div>
        {authControl}
      </div>
    </header>
  </>
}
