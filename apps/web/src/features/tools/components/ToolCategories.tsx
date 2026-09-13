import { TOOL_CATEGORIES, type ConversionTool, type ToolCategory } from '../types'

export function ToolCategories({ tools, active, onSelect }: { tools: ConversionTool[]; active: ToolCategory; onSelect: (category: ToolCategory) => void }) {
  return (
    <nav className="tool-categories" aria-label="Tool categories">
        {TOOL_CATEGORIES.map((category) => {
          const count = category === 'All tools' ? tools.length : tools.filter((tool) => tool.category === category).length
          const selected = category === active
          return <button className={selected ? 'active' : ''} type="button" key={category} aria-pressed={selected} onClick={() => onSelect(category)}>{category}<span>{count}</span></button>
        })}
    </nav>
  )
}
