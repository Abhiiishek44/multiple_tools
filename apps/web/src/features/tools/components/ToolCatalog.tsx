import { useMemo, useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import { ALL_TOOLS, matchesToolQuery } from '../catalog'
import type { ConversionTool } from '../types'
import { ToolCard } from './ToolCard'
import { ToolCategories } from './ToolCategories'
import { ToolSearch, type ToolLayout } from './ToolSearch'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; onRetry: () => void; onSelect: (tool: ConversionTool) => void }

export function ToolCatalog({ tools, isLoading, error, onRetry, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL_TOOLS)
  const [layout, setLayout] = useState<ToolLayout>('cards')
  const filteredTools = useMemo(() => tools.filter((tool) => (
    (activeCategory === ALL_TOOLS || tool.category === activeCategory) && matchesToolQuery(tool, query)
  )), [activeCategory, query, tools])
  const groups = useMemo(() => Array.from(new Set(tools.map((tool) => tool.category))).map((category) => ({
    category,
    tools: filteredTools.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length), [filteredTools, tools])

  return (
    <>
      <section className="mx-auto min-h-[70vh] w-[min(1400px,calc(100%_-_48px))] pb-[72px] pt-12 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:pt-7" id="conversion-tools" aria-labelledby="tools-title">
          <div className="flex items-end justify-between gap-[18px] max-[700px]:items-start">
            <div>
              <h1 className="m-0 tracking-[-.055em]" id="tools-title">
                <span className="block text-[clamp(42px,5vw,64px)] font-[850] leading-[.98] text-[var(--text)] max-[700px]:text-[42px]">
                  Love your <span className="text-[var(--accent)]">documents.</span>
                </span>
                <span className="mt-3 flex items-center gap-3 text-[clamp(24px,2.7vw,36px)] font-[650] leading-tight tracking-[-.035em] text-[var(--muted)] max-[700px]:mt-2 max-[700px]:text-[25px]">
                  We’ll handle the rest.
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] text-base shadow-[inset_0_1px_0_rgba(255,255,255,.55)] max-[700px]:size-8 max-[700px]:text-sm" aria-hidden="true">❤️</span>
                </span>
              </h1>
              <p className="mb-0 mt-5 text-sm font-medium leading-[1.6] text-[var(--faint)]">Search all converters, grouped by category.</p>
            </div>
            <span className="text-xs text-[var(--faint)] max-[700px]:hidden">{filteredTools.length} tools</span>
          </div>
          <ToolSearch query={query} count={filteredTools.length} isLoading={isLoading} layout={layout} onChange={setQuery} onLayoutChange={setLayout} />
          <ToolCategories tools={tools} active={activeCategory} onSelect={setActiveCategory} />
          {error && <Alert className="mt-5 flex items-center justify-between gap-4"><span>{error}</span><button className="shrink-0 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700" type="button" onClick={onRetry}>Retry API</button></Alert>}
          {isLoading ? <div className={layout === 'cards' ? 'mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2' : 'mt-7 grid gap-2'} aria-label="Loading tools">{Array.from({ length: 10 }, (_, index) => <div className={layout === 'cards' ? 'min-h-[190px] animate-pulse rounded-[18px] bg-[var(--surface-strong)]' : 'min-h-[78px] animate-pulse rounded-2xl bg-[var(--surface-strong)]'} key={index} />)}</div> : groups.length ? <div className="mt-10 grid gap-12">{groups.map((group) => <section key={group.category} aria-labelledby={`category-${group.category}`}><div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3"><h2 className="m-0 text-xl tracking-[-.025em]" id={`category-${group.category}`}>{group.category}</h2><span className="text-[11px] text-[var(--faint)]">{group.tools.length} tools</span></div><div className={layout === 'cards' ? 'grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3' : 'grid gap-2'}>{group.tools.map((tool) => <ToolCard tool={tool} onSelect={onSelect} variant={layout === 'cards' ? 'card' : 'row'} key={tool.id} />)}</div></section>)}</div> : !error && <p className="py-[70px] text-center text-[var(--muted)]">No tools match “{query}”.</p>}
      </section>
    </>
  )
}
