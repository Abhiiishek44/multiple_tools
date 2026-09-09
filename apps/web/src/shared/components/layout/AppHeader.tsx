import type { ReactNode } from 'react'
import { LockIcon } from '../icons/Icons'

type AppHeaderProps = {
  authControl: ReactNode
  selectedTool: { from: string; name: string } | null
  onHome: () => void
}

export function AppHeader({ authControl, selectedTool, onHome }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[73px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur sm:px-8">
      <button className="flex shrink-0 items-center gap-2.5 text-xl font-black tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600" type="button" aria-label="Convertly home" onClick={onHome}>
        <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20" aria-hidden="true"><svg className="size-6 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg></span>
        <span className="hidden sm:inline">Convertly</span>
      </button>
      <div className="flex min-w-0 items-center gap-3">
        {selectedTool && (
          <button className="hidden min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50 md:flex" type="button" onClick={onHome} title="Back to all tools">
            <span className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-black text-white">{selectedTool.from}</span>
            <span className="min-w-0"><small className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Selected service</small><strong className="block truncate text-xs text-slate-800">{selectedTool.name}</strong></span>
            <i className="ml-1 text-lg not-italic text-slate-400" aria-hidden="true">×</i>
          </button>
        )}
        {authControl}
        <div className="hidden items-center gap-1.5 text-xs font-bold text-slate-500 xl:flex [&_svg]:size-4"><LockIcon /><span>Private &amp; secure</span></div>
      </div>
    </header>
  )
}
