import { ALL_TOOLS, getCategorySlug, getToolCategories } from '../catalog'
import type { ConversionTool, ToolCategory } from '../types'
import { cn } from '../../../shared/styles'

export function ToolCategories({ tools, active, onSelect }: { tools: ConversionTool[]; active: ToolCategory; onSelect: (category: ToolCategory) => void }) {
  return (
    <nav className="mt-[18px] flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] max-[700px]:-mr-4" aria-label="Tool categories">
        {getToolCategories(tools).map((category) => {
          const count = category === ALL_TOOLS ? tools.length : tools.filter((tool) => tool.category === category).length
          const selected = category === active
          const href = category === ALL_TOOLS ? '/tools' : `/categories/${getCategorySlug(category, tools)}`
          return <a className={cn('flex min-h-[38px] shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-[var(--surface-soft)] px-[13px] text-[13px] text-[var(--muted)] no-underline [&>span]:rounded-lg [&>span]:bg-[color-mix(in_srgb,currentColor_10%,transparent)] [&>span]:px-[5px] [&>span]:py-0.5 [&>span]:text-[8px]', selected && 'bg-[var(--accent)] font-[750] text-[var(--accent-text)]')} href={href} key={category} aria-current={selected ? 'page' : undefined} onClick={(event) => { event.preventDefault(); onSelect(category) }}>{category}<span>{count}</span></a>
        })}
    </nav>
  )
}
