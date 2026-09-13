import type { ConversionTool } from '../types'
import { useUi } from '../../../shared/context/useUi'
import { HeartIcon } from '../../../shared/components/icons/Icons'
import { getToolCardSummary } from '../catalog'
import { ToolVisual } from './ToolVisual'

export function ToolCard({ tool, onSelect }: { tool: ConversionTool; onSelect: (tool: ConversionTool) => void }) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
  return (
    <article className="tool-card"><button className="tool-card-main" type="button" onClick={() => onSelect(tool)} aria-label={`Open ${tool.name}`}><span className={`tool-card-visual tone-${tool.category.toLowerCase()}`} aria-hidden="true"><ToolVisual tool={tool} /></span><span className="tool-card-copy"><strong>{tool.name}</strong><small>{getToolCardSummary(tool)}</small></span></button><button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} type="button" onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove' : 'Add'} ${tool.name} ${favorite ? 'from' : 'to'} favorites`}><HeartIcon /></button></article>
  )
}
