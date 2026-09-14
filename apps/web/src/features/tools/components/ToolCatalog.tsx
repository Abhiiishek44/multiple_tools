import { useMemo, useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import { matchesToolQuery } from '../catalog'
import type { ConversionTool, ToolCategory } from '../types'
import { ToolCard } from './ToolCard'
import { ToolCategories } from './ToolCategories'
import { ToolSearch } from './ToolSearch'
import { eyebrow } from '../../../shared/styles'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; category: ToolCategory; onRetry: () => void; onSelect: (tool: ConversionTool) => void; onCategory: (category: ToolCategory) => void }

export function ToolCatalog({ tools, isLoading, error, category, onRetry, onSelect, onCategory }: Props) {
  const [query, setQuery] = useState('')
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => (category === 'All tools' || tool.category === category) && matchesToolQuery(tool, query))
  }, [category, query, tools])

  const selectCategory = (next: ToolCategory) => {
    onCategory(next)
    window.requestAnimationFrame(() => document.querySelector('#conversion-tools')?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <section className="mx-auto min-h-[70vh] w-[min(1400px,calc(100%_-_48px))] pb-[72px] pt-16 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:pt-[38px]" id="conversion-tools" aria-labelledby="tools-title">
          <div className="flex items-end justify-between gap-[18px] max-[700px]:items-start"><div><p className={eyebrow}>Tool library</p><h1 className="m-0 text-[clamp(34px,3.8vw,48px)] font-[720] tracking-[-.04em] text-[var(--text)] max-[700px]:text-4xl" id="tools-title">{category === 'All tools' ? `All ${tools.length || ''} tools` : `${category} tools`}</h1><p className="mb-0 mt-2.5 text-base text-[var(--muted)]">Search, filter, and open any converter in a single click.</p></div><span className="text-xs text-[var(--faint)] max-[700px]:hidden">{filteredTools.length} results</span></div>
          <ToolSearch query={query} count={filteredTools.length} isLoading={isLoading} onChange={setQuery} />
          <ToolCategories tools={tools} active={category} onSelect={selectCategory} />
          {error && <Alert className="mt-5 flex items-center justify-between gap-4"><span>{error}</span><button className="shrink-0 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700" type="button" onClick={onRetry}>Retry API</button></Alert>}
          {isLoading ? <div className="mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3" aria-label="Loading tools">{Array.from({ length: 10 }, (_, index) => <div className="min-h-[190px] animate-pulse rounded-[18px] bg-[var(--surface-strong)] max-[700px]:min-h-[198px]" key={index} />)}</div> : <div className="mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3">{filteredTools.map((tool) => <ToolCard tool={tool} onSelect={onSelect} key={tool.id} />)}{!filteredTools.length && !error && <p className="col-span-full py-[70px] text-center text-[var(--muted)]">No tools match “{query}”.</p>}</div>}
      </section>
    </>
  )
}
