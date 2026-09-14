import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '../../../shared/styles'
import { CodeBlock } from './CodeBlock'

export type CodeExample = {
  id: string
  label: string
  badge: string
  language: string
  description: string
  code: string
}

export function CodeExampleTabs({ examples }: { examples: CodeExample[] }) {
  const [activeId, setActiveId] = useState(examples[0]?.id)
  const groupId = useId()
  const activeExample = examples.find((example) => example.id === activeId) ?? examples[0]

  if (!activeExample) return null

  const selectWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = examples.length - 1
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % examples.length
      : event.key === 'ArrowLeft' ? (index - 1 + examples.length) % examples.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? lastIndex
            : -1
    if (nextIndex < 0) return
    event.preventDefault()
    setActiveId(examples[nextIndex].id)
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    tabs?.[nextIndex]?.focus()
  }

  return (
    <div className="mt-6">
      <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-1.5 [scrollbar-width:none]" role="tablist" aria-label="Code example language">
        {examples.map((example, index) => {
          const selected = example.id === activeExample.id
          return (
            <button
              className={cn(
                'flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-transparent bg-transparent px-3.5 text-xs font-bold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]',
                selected && 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[0_4px_14px_rgba(20,24,16,.06)]',
              )}
              id={`${groupId}-${example.id}-tab`}
              key={example.id}
              type="button"
              role="tab"
              aria-controls={`${groupId}-${example.id}-panel`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(example.id)}
              onKeyDown={(event) => selectWithKeyboard(event, index)}
            >
              <span className={cn('grid h-6 min-w-7 place-items-center rounded-md bg-[var(--surface-strong)] px-1.5 text-[8px] font-black tracking-[.04em] text-[var(--muted)]', selected && 'bg-[var(--accent)] text-[var(--accent-text)]')}>{example.badge}</span>
              {example.label}
            </button>
          )
        })}
      </div>

      <div id={`${groupId}-${activeExample.id}-panel`} role="tabpanel" aria-labelledby={`${groupId}-${activeExample.id}-tab`} tabIndex={0}>
        <div className="mt-4 flex items-start justify-between gap-5 max-[700px]:flex-col max-[700px]:gap-1">
          <div><strong className="text-sm">{activeExample.label}</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--muted)]">{activeExample.description}</p></div>
          <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.08em] text-[var(--faint)]">{activeExample.language}</span>
        </div>
        <CodeBlock code={activeExample.code} language={activeExample.language} label={activeExample.label} />
      </div>
    </div>
  )
}
