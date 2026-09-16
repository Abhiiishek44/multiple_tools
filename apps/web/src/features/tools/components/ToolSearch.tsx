import { useEffect, useRef } from 'react'
import { GridIcon, ListIcon } from '../../../shared/components/icons/Icons'
import { cn } from '../../../shared/styles'

export type ToolLayout = 'cards' | 'rows'

type Props = {
  query: string
  count: number
  isLoading: boolean
  layout: ToolLayout
  onChange: (query: string) => void
  onLayoutChange: (layout: ToolLayout) => void
}

export function ToolSearch({ query, count, isLoading, layout, onChange, onLayoutChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  return (
    <div className="mt-[30px] flex w-full items-center gap-3">
      <label className="flex h-[54px] min-w-0 max-w-[1080px] flex-1 cursor-text items-center gap-3 rounded-2xl border border-transparent bg-[var(--surface-soft)] px-4 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[var(--border)] hover:bg-[var(--surface-strong)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_28%,transparent)] [&_svg]:w-[19px] [&_svg]:text-[var(--muted)]">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
        <input ref={inputRef} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--text)]" style={{ outline: 'none' }} type="search" value={query} onChange={(event) => onChange(event.target.value)} placeholder="Search tools by name, format, or keyword…" aria-label="Search conversion tools" />
        <kbd className="shrink-0 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 font-sans text-[9px] font-semibold text-[var(--faint)] max-[700px]:hidden">Ctrl K</kbd>
        <span className="shrink-0 text-[10px] font-bold text-[var(--faint)] max-[560px]:hidden">{isLoading ? 'Loading…' : `${count} tools`}</span>
      </label>
      <div className="ml-auto flex shrink-0 gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1" role="group" aria-label="Tool layout">
        <LayoutButton active={layout === 'cards'} label="Card view" onClick={() => onLayoutChange('cards')}><GridIcon /></LayoutButton>
        <LayoutButton active={layout === 'rows'} label="Row view" onClick={() => onLayoutChange('rows')}><ListIcon /></LayoutButton>
      </div>
    </div>
  )
}

function LayoutButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return <button className={cn('grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[var(--faint)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] [&_svg]:size-4', active && 'bg-[var(--surface-strong)] text-[var(--text)]')} type="button" aria-label={label} aria-pressed={active} title={label} onClick={onClick}>{children}</button>
}
