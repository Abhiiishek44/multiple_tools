import type { ConversionTool } from '../types'
import { ToolVisual } from './ToolVisual'

export function ToolCard({ tool, index, onSelect }: { tool: ConversionTool; index: number; onSelect: (tool: ConversionTool) => void }) {
  return (
    <button className="group relative min-h-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-300/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="button" onClick={() => onSelect(tool)} aria-label={`Open ${tool.name}`}>
      <span className="absolute right-4 top-4 text-xs font-extrabold tracking-widest text-slate-300">{String(index + 1).padStart(2, '0')}</span>
      <span className="flex h-28 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-blue-50" aria-hidden="true"><ToolVisual tool={tool} /></span>
      <span className="mt-5 block pr-6"><strong className="block text-base font-extrabold text-slate-950">{tool.name}</strong><small className="mt-1.5 block line-clamp-2 leading-5 text-slate-500">{tool.description}</small></span>
      <span className="absolute bottom-5 right-5 text-lg text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600" aria-hidden="true">↗</span>
    </button>
  )
}
