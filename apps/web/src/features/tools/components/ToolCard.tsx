import type { ConversionTool } from '../types'
import { useUi } from '../../../shared/context/useUi'
import { HeartIcon } from '../../../shared/components/icons/Icons'
import { getToolCardSummary } from '../catalog'
import { ToolIcon } from './ToolIcon'
import { cn } from '../../../shared/styles'

export function ToolCard({ tool, onSelect, variant = 'card' }: { tool: ConversionTool; onSelect: (tool: ConversionTool) => void; variant?: 'card' | 'row' }) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
  const favoriteButton = <button className={cn('favorite-button grid size-[31px] cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--faint)] transition-[color,background-color,border-color,transform] hover:bg-[var(--surface-strong)] hover:text-[var(--text)] active:scale-90 [&_svg]:size-[15px]', favorite && 'is-favorite border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] text-[#f05252] [&_svg]:stroke-[#f05252]')} type="button" aria-pressed={favorite} onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove' : 'Add'} ${tool.name} ${favorite ? 'from' : 'to'} favorites`}><HeartIcon filled={favorite} /></button>

  if (variant === 'row') return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] transition-[border-color,background-color] hover:border-[color-mix(in_srgb,var(--accent)_65%,var(--border))] hover:bg-[var(--surface-strong)]">
      <a className="flex min-h-[78px] w-full cursor-pointer items-center gap-4 px-4 py-3 pr-16 text-left text-inherit no-underline" href={`/${tool.slug}`} onClick={(event) => { event.preventDefault(); onSelect(tool) }} aria-label={`Open ${tool.name}`}><ToolIcon tool={tool} size="small" /><span className="min-w-0"><strong className="block text-sm tracking-[-.02em]">{tool.name}</strong><small className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[var(--muted)]">{getToolCardSummary(tool)}</small></span></a>
      <span className="absolute right-4 top-1/2 -translate-y-1/2">{favoriteButton}</span>
    </article>
  )

  return (
    <article className="relative min-h-[190px] min-w-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-[color-mix(in_srgb,var(--accent)_65%,var(--border))] hover:shadow-[var(--panel-shadow)] max-[700px]:min-h-[198px]"><a className="flex h-full min-h-[190px] w-full cursor-pointer flex-col items-start border-0 bg-transparent p-[18px] text-left text-inherit no-underline max-[700px]:min-h-[198px] max-[700px]:p-[15px]" href={`/${tool.slug}`} onClick={(event) => { event.preventDefault(); onSelect(tool) }} aria-label={`Open ${tool.name}`}><ToolIcon tool={tool} /><span className="mt-auto block pt-6"><strong className="block max-w-[calc(100%_-_20px)] text-base leading-[1.15] tracking-[-.025em] max-[700px]:text-[15px]">{tool.name}</strong><small className="mt-2 line-clamp-2 overflow-hidden text-xs leading-[1.45] text-[var(--muted)] max-[700px]:text-[11px]">{getToolCardSummary(tool)}</small></span></a><span className="absolute right-3.5 top-3.5">{favoriteButton}</span></article>
  )
}
