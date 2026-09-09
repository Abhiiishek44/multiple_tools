export function ToolSearch({ query, count, isLoading, onChange }: { query: string; count: number; isLoading: boolean; onChange: (query: string) => void }) {
  return (
    <label className="mt-9 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
      <svg className="size-5 shrink-0 fill-none stroke-slate-400 stroke-2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
      <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" value={query} onChange={(event) => onChange(event.target.value)} placeholder="Search all conversion tools…" aria-label="Search conversion tools" />
      <span className="shrink-0 text-xs font-bold text-slate-400">{isLoading ? 'Loading…' : `${count} tools`}</span>
    </label>
  )
}
