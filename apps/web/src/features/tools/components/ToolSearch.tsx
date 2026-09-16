export function ToolSearch({ query, count, isLoading, onChange }: { query: string; count: number; isLoading: boolean; onChange: (query: string) => void }) {
  return (
    <label className="mt-[30px] flex h-[54px] w-[min(980px,100%)] cursor-text items-center gap-3 rounded-2xl border border-transparent bg-[var(--surface-soft)] px-4 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[var(--border)] hover:bg-[var(--surface-strong)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_28%,transparent)] [&_svg]:w-[19px] [&_svg]:text-[var(--muted)]">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
      <input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--text)] outline-0" type="search" value={query} onChange={(event) => onChange(event.target.value)} placeholder="Search tools by name, format, or keyword…" aria-label="Search conversion tools" />
      <span className="text-[10px] font-bold text-[var(--faint)]">{isLoading ? 'Loading…' : `${count} tools`}</span>
    </label>
  )
}
