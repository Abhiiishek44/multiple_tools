import { useEffect, useMemo, useRef, useState } from 'react'
import type { ConversionTool } from '../../../features/tools/types'
import { matchesToolQuery } from '../../../features/tools/catalog'
import { useUi } from '../../context/useUi'
import { HeartIcon, SearchIcon } from '../icons/Icons'

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

  return <div className="finder-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section className="tool-finder" role="dialog" aria-modal="true" aria-label={favoritesOnly ? 'Favorite tools' : 'Search tools'}><div className="finder-input"><SearchIcon /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={favoritesOnly ? 'Search your favorites…' : 'Search tools by name or category…'} aria-label="Search tools" /><kbd>ESC</kbd></div><div className="finder-heading"><strong>{favoritesOnly ? 'Favorite tools' : 'All tools'}</strong><span>{results.length} shown</span></div><div className="finder-results">{results.map((tool) => <div className="finder-result" key={tool.id}><button type="button" onClick={() => { onSelect(tool); onClose() }}><span className={`tool-dot tone-${tool.category.toLowerCase()}`}>{tool.from.slice(0, 3)}</span><span><strong>{tool.name}</strong><small>{tool.category} · {tool.description}</small></span></button><button className={isFavorite(tool.id) ? 'is-favorite' : ''} type="button" aria-label={`${isFavorite(tool.id) ? 'Remove' : 'Add'} ${tool.name} ${isFavorite(tool.id) ? 'from' : 'to'} favorites`} onClick={() => toggleFavorite(tool.id)}><HeartIcon /></button></div>)}{!results.length && <div className="finder-empty"><HeartIcon /><strong>{favoritesOnly ? 'No favorite tools yet' : 'No matching tools'}</strong><p>{favoritesOnly ? 'Use the heart on any tool card to keep it here.' : 'Try a shorter search or browse by category.'}</p></div>}</div></section></div>
}
