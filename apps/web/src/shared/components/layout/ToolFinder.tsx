import { useEffect, useMemo, useRef, useState } from 'react'
import type { ConversionTool } from '../../../features/tools/types'
import { matchesToolQuery } from '../../../features/tools/catalog'
import { useUi } from '../../context/useUi'
import { HeartIcon, SearchIcon } from '../icons/Icons'
import { cn, toneClass } from '../../styles'

type Props = { tools: ConversionTool[]; favoritesOnly?: boolean; onClose: () => void; onSelect: (tool: ConversionTool) => void }

export function ToolFinder({ tools, favoritesOnly = false, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { favorites, isFavorite, toggleFavorite } = useUi()
  const results = useMemo(() => tools
    .filter((tool) => (!favoritesOnly || favorites.includes(tool.id)) && matchesToolQuery(tool, query))
    .slice(0, 12), [favorites, favoritesOnly, query, tools])

  useEffect(() => {
    inputRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className="fixed inset-0 z-100 grid place-items-start justify-center bg-[rgba(5,5,4,.5)] px-[18px] pb-[18px] pt-[max(8vh,50px)] backdrop-blur-[5px]" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section className="max-h-[min(720px,82vh)] w-[min(650px,100%)] overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_100px_rgba(0,0,0,.25)]" role="dialog" aria-modal="true" aria-label={favoritesOnly ? 'Favorite tools' : 'Search tools'}><div className="flex items-center gap-3 border-b border-[var(--border)] px-[18px] py-4 [&_svg]:w-[21px] [&_svg]:text-[var(--muted)]"><SearchIcon /><input className="min-w-0 flex-1 border-0 bg-transparent text-base text-[var(--text)] outline-0" ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={favoritesOnly ? 'Search your favorites…' : 'Search tools by name or category…'} aria-label="Search tools" /><kbd className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 font-sans text-[9px] font-bold text-[var(--accent-text)]">ESC</kbd></div><div className="flex items-center justify-between px-[18px] pb-2 pt-3.5 text-[11px] [&>span]:text-[var(--faint)]"><strong>{favoritesOnly ? 'Favorite tools' : 'All tools'}</strong><span>{results.length} shown</span></div><div className="max-h-[calc(82vh-110px)] overflow-y-auto px-2.5 pb-3 pt-1.5">{results.map((tool) => <div className="flex items-center rounded-[13px] hover:bg-[var(--surface-soft)]" key={tool.id}><button className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-[9px] text-left" type="button" onClick={() => { onSelect(tool); onClose() }}><span className={cn(toneClass(tool.category), 'grid size-[38px] shrink-0 place-items-center rounded-[11px] bg-[var(--tone)] text-[9px] font-black text-white')}>{tool.from.slice(0, 3)}</span><span><strong className="block text-xs">{tool.name}</strong><small className="mt-[3px] block max-w-[450px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--muted)]">{tool.category} · {tool.description}</small></span></button><button className={cn('grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--faint)] [&_svg]:size-4', isFavorite(tool.id) && '[&_svg]:fill-[#f05252] [&_svg]:stroke-[#f05252]')} type="button" aria-label={`${isFavorite(tool.id) ? 'Remove' : 'Add'} ${tool.name} ${isFavorite(tool.id) ? 'from' : 'to'} favorites`} onClick={() => toggleFavorite(tool.id)}><HeartIcon /></button></div>)}{!results.length && <div className="grid min-h-[250px] place-items-center content-center gap-2 text-center [&_svg]:w-7 [&_svg]:text-[var(--faint)]"><HeartIcon /><strong>{favoritesOnly ? 'No favorite tools yet' : 'No matching tools'}</strong><p className="m-0 text-xs text-[var(--muted)]">{favoritesOnly ? 'Use the heart on any tool card to keep it here.' : 'Try a shorter search or browse by category.'}</p></div>}</div></section></div>
}
