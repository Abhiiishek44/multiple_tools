import type { ConversionTool } from '../../../features/tools/types'
import { HeartIcon } from '../icons/Icons'

type Props = { tools: ConversionTool[]; favoriteIds: string[]; onClose: () => void; onSelect: (tool: ConversionTool) => void }

export function FavoritesDropdown({ tools, favoriteIds, onClose, onSelect }: Props) {
  const favorites = tools.filter((tool) => favoriteIds.includes(tool.id))

  return (
    <section className="absolute right-0 top-[calc(100%_+_8px)] z-70 w-[min(310px,calc(100vw_-_24px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(0,0,0,.18)]" role="dialog" aria-label="Favorite tools">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3"><strong className="text-sm">Favorites</strong><span className="text-[10px] text-[var(--faint)]">{favorites.length}</span></div>
      <div className="max-h-[360px] overflow-y-auto p-1.5">
        {favorites.map((tool) => <button className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[13px] text-[var(--text)] transition hover:bg-[var(--surface-soft)] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[var(--faint)]" type="button" key={tool.id} onClick={() => { onSelect(tool); onClose() }}><HeartIcon filled /><span className="overflow-hidden text-ellipsis whitespace-nowrap">{tool.name}</span></button>)}
        {!favorites.length && <p className="m-0 px-3 py-5 text-center text-xs text-[var(--muted)]">No favorite tools yet.</p>}
      </div>
    </section>
  )
}
