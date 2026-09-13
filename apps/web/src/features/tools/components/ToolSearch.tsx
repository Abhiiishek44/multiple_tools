export function ToolSearch({ query, count, isLoading, onChange }: { query: string; count: number; isLoading: boolean; onChange: (query: string) => void }) {
  return (
    <label className="catalog-search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
      <input value={query} onChange={(event) => onChange(event.target.value)} placeholder="Search tools by name, format, or keyword…" aria-label="Search conversion tools" />
      <span>{isLoading ? 'Loading…' : `${count} tools`}</span>
    </label>
  )
}
