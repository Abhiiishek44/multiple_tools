import { TOOL_CATEGORIES, type ConversionTool, type ToolCategory } from '../types'

export function ToolCategories({ tools, active, onSelect }: { tools: ConversionTool[]; active: ToolCategory; onSelect: (category: ToolCategory) => void }) {
  return (
    <nav className="sticky top-[73px] z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Tool categories">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3">
        {TOOL_CATEGORIES.map((category) => {
          const count = category === 'All tools' ? tools.length : tools.filter((tool) => tool.category === category).length
          const selected = category === active
          return <button className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${selected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`} type="button" key={category} aria-pressed={selected} onClick={() => onSelect(category)}>{category}<span className={`rounded-full px-2 py-0.5 text-[10px] ${selected ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>{count}</span></button>
        })}
      </div>
    </nav>
  )
}
