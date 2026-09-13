import { useMemo, useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import { matchesToolQuery } from '../catalog'
import type { ConversionTool, ToolCategory } from '../types'
import { ToolCard } from './ToolCard'
import { ToolCategories } from './ToolCategories'
import { ToolSearch } from './ToolSearch'

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
      <section className="catalog-controls" id="conversion-tools" aria-labelledby="tools-title">
          <div className="catalog-title"><div><p className="eyebrow">Tool library</p><h1 id="tools-title">{category === 'All tools' ? `All ${tools.length || ''} tools` : `${category} tools`}</h1><p>Search, filter, and open any converter in a single click.</p></div><span>{filteredTools.length} results</span></div>
          <ToolSearch query={query} count={filteredTools.length} isLoading={isLoading} onChange={setQuery} />
          <ToolCategories tools={tools} active={category} onSelect={selectCategory} />
          {error && <Alert className="mt-5 flex items-center justify-between gap-4"><span>{error}</span><button className="shrink-0 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700" type="button" onClick={onRetry}>Retry API</button></Alert>}
          {isLoading ? <div className="tool-grid" aria-label="Loading tools">{Array.from({ length: 10 }, (_, index) => <div className="tool-card skeleton" key={index} />)}</div> : <div className="tool-grid">{filteredTools.map((tool) => <ToolCard tool={tool} onSelect={onSelect} key={tool.id} />)}{!filteredTools.length && !error && <p className="empty-tools">No tools match “{query}”.</p>}</div>}
      </section>
    </>
  )
}
