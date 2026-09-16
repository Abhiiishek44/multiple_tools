import { CategoryIcon } from '../../../shared/components/icons/Icons'
import { ALL_TOOLS, getToolCategories } from '../catalog'
import type { ConversionTool, ToolCategory } from '../types'

type Props = {
  tools: ConversionTool[]
  active: ToolCategory
  onSelect: (category: ToolCategory) => void
}

export function ToolCategories({ tools, active, onSelect }: Props) {
  return (
    <nav className="mt-4 flex gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filter tools by category">
      {getToolCategories(tools).map((category) => {
        const selected = category === active
        const count = category === ALL_TOOLS ? tools.length : tools.filter((tool) => tool.category === category).length
        return (
          <button
            className="flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-xs font-medium leading-none text-[var(--muted)] transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] aria-pressed:border-[var(--accent)] aria-pressed:bg-[var(--accent)] aria-pressed:font-semibold aria-pressed:text-[var(--accent-text)] aria-pressed:hover:border-[var(--accent-strong)] aria-pressed:hover:bg-[var(--accent-strong)]"
            type="button"
            key={category}
            aria-pressed={selected}
            aria-label={`${categoryLabel(category)}, ${count} tools`}
            onClick={() => onSelect(category)}
          >
            <span className="grid size-4 shrink-0 place-items-center text-current [&_svg]:block [&_svg]:size-[15px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.9] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]" aria-hidden="true">
              <CategoryIcon category={category} />
            </span>
            <span className="whitespace-nowrap leading-none">{categoryLabel(category)}</span>
          </button>
        )
      })}
    </nav>
  )
}

function categoryLabel(category: ToolCategory) {
  if (category === ALL_TOOLS) return 'All Tools'
  if (category === 'Documents') return 'Document Tools'
  if (category === 'Spreadsheets') return 'Spreadsheet Tools'
  if (category === 'Images') return 'Image Tools'
  return `${category} Tools`
}
