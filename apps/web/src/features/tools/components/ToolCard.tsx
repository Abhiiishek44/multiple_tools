import type { ConversionTool } from '../types'
import { useUi } from '../../../shared/context/useUi'
import { HeartIcon } from '../../../shared/components/icons/Icons'
import { getToolCardSummary } from '../catalog'
import { ToolVisual } from './ToolVisual'
import { cn, toneClass } from '../../../shared/styles'

export function ToolCard({ tool, onSelect }: { tool: ConversionTool; onSelect: (tool: ConversionTool) => void }) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
  return (
    <article className="relative min-h-[190px] min-w-0 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-[color-mix(in_srgb,var(--accent)_65%,var(--border))] hover:shadow-[var(--panel-shadow)] max-[700px]:min-h-[198px]"><a className="flex h-full min-h-[190px] w-full cursor-pointer flex-col items-start border-0 bg-transparent p-[18px] text-left text-inherit no-underline max-[700px]:min-h-[198px] max-[700px]:p-[15px]" href={`/${tool.slug}`} onClick={(event) => { event.preventDefault(); onSelect(tool) }} aria-label={`Open ${tool.name}`}><span className={cn(toneClass(tool.category), 'grid size-[52px] place-items-center rounded-[14px] bg-[var(--tone)] shadow-[inset_0_0_0_2px_color-mix(in_srgb,white_28%,transparent),0_5px_14px_color-mix(in_srgb,var(--tone)_20%,transparent)]')} aria-hidden="true"><ToolVisual tool={tool} /></span><span className="mt-auto block pt-6"><strong className="block max-w-[calc(100%_-_20px)] text-base leading-[1.15] tracking-[-.025em] max-[700px]:text-[15px]">{tool.name}</strong><small className="mt-2 line-clamp-2 overflow-hidden text-xs leading-[1.45] text-[var(--muted)] max-[700px]:text-[11px]">{getToolCardSummary(tool)}</small></span></a><button className={cn('absolute right-3.5 top-3.5 grid size-[31px] cursor-pointer place-items-center rounded-full border-0 bg-[var(--surface)] text-[var(--faint)] transition-[transform,color,background-color] duration-200 hover:bg-[var(--surface-strong)] active:scale-75 [&_svg]:size-[15px] [&_svg]:transition-[fill,stroke,transform] [&_svg]:duration-200', favorite && 'text-[#f05252] [&_svg]:animate-[heart-pop_320ms_ease-out] [&_svg]:stroke-[#f05252]')} type="button" aria-pressed={favorite} onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove' : 'Add'} ${tool.name} ${favorite ? 'from' : 'to'} favorites`}><HeartIcon filled={favorite} /></button></article>
  )
}
