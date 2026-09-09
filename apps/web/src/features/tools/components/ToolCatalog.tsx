import { useMemo, useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import type { ConversionTool, ToolCategory } from '../types'
import { ToolCard } from './ToolCard'
import { ToolCategories } from './ToolCategories'
import { ToolSearch } from './ToolSearch'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; onRetry: () => void; onSelect: (tool: ConversionTool) => void }

export function ToolCatalog({ tools, isLoading, error, onRetry, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ToolCategory>('All tools')
  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return tools.filter((tool) => (category === 'All tools' || tool.category === category) && (!normalized || `${tool.name} ${tool.description} ${tool.from} ${tool.to}`.toLowerCase().includes(normalized)))
  }, [category, query, tools])

  const selectCategory = (next: ToolCategory) => {
    setCategory(next)
    window.requestAnimationFrame(() => document.querySelector('#conversion-tools')?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <ToolCategories tools={tools} active={category} onSelect={selectCategory} />
      <section className="scroll-mt-36 px-5 py-16" id="conversion-tools" aria-labelledby="tools-title">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="text-xs font-extrabold tracking-[0.18em] text-blue-600">01 / {filteredTools.length} TOOLS</span><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl" id="tools-title">{category === 'All tools' ? 'Choose your converter' : `${category} tools`}</h2></div><p className="max-w-md leading-7 text-slate-500">Click any service to begin. Your selected tool will stay visible while you work.</p></div>
          <ToolSearch query={query} count={filteredTools.length} isLoading={isLoading} onChange={setQuery} />
          {error && <Alert className="mt-5 flex items-center justify-between gap-4"><span>{error}</span><button className="shrink-0 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700" type="button" onClick={onRetry}>Retry API</button></Alert>}
          {isLoading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading tools">{Array.from({ length: 10 }, (_, index) => <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" key={index} />)}</div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredTools.map((tool, index) => <ToolCard tool={tool} index={index} onSelect={onSelect} key={tool.id} />)}{!filteredTools.length && !error && <p className="col-span-full py-16 text-center text-slate-500">No tools match “{query}”.</p>}</div>}
        </div>
      </section>
    </>
  )
}
