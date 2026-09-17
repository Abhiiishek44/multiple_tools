import type { ConversionTool } from '../../../features/tools/types'
import { useUi } from '../../context/useUi'
import { CloseIcon, HeartIcon } from '../icons/Icons'

type Props = { tools: ConversionTool[]; favoriteIds: string[]; onClose: () => void; onSelect: (tool: ConversionTool) => void }

export function FavoritesDropdown({ tools, favoriteIds, onClose, onSelect }: Props) {
  const { toggleFavorite } = useUi()
  const favorites = tools.filter((tool) => favoriteIds.includes(tool.id))

  return (
    <section className="absolute right-0 top-[calc(100%_+_8px)] z-70 w-[min(310px,calc(100vw_-_24px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(0,0,0,.18)]" role="dialog" aria-label="Favorite tools">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3"><strong className="text-sm">Favorites</strong><span className="text-[10px] text-[var(--faint)]">{favorites.length}</span></div>
      <div className="max-h-[360px] overflow-y-auto p-1.5">
        {favorites.map((tool) => <div className="group flex min-h-11 items-center rounded-lg transition-colors hover:bg-[var(--surface-soft)]" key={tool.id}><button className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2 text-left text-[13px] text-[var(--text)] [&_svg]:size-4 [&_svg]:shrink-0" type="button" onClick={() => { onSelect(tool); onClose() }}><HeartIcon filled /><span className="overflow-hidden text-ellipsis whitespace-nowrap">{tool.name}</span></button><button className="mr-1.5 grid size-8 shrink-0 cursor-pointer place-items-center rounded-md border border-transparent bg-transparent text-[var(--faint)] opacity-70 transition-[color,background-color,border-color,opacity] hover:border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] hover:bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] hover:text-[var(--danger)] hover:opacity-100 focus-visible:opacity-100 [&_svg]:size-3.5" type="button" aria-label={`Remove ${tool.name} from favorites`} title="Remove from favorites" onClick={() => toggleFavorite(tool.id)}><CloseIcon /></button></div>)}
        {!favorites.length && <p className="m-0 px-3 py-5 text-center text-xs text-[var(--muted)]">No favorite tools yet.</p>}
      </div>
    </section>
  )
}
