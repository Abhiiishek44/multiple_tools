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
    const nextIndex = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % examples.length
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index - 1 + examples.length) % examples.length
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
    <div className="mt-8 grid grid-cols-[190px_minmax(0,1fr)] items-start gap-x-10 gap-y-5 max-[760px]:grid-cols-1">
      <div className="grid gap-2" role="tablist" aria-label="Code example language" aria-orientation="vertical">
        {examples.map((example, index) => {
          const selected = example.id === activeExample.id
          return (
            <button
              className={cn(
                'flex min-h-11 w-full cursor-pointer items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-soft)]',
                selected && 'border-[var(--accent)]! bg-[var(--accent)]! [&_strong]:text-[var(--accent-text)]!',
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
              <strong className="text-xs font-semibold text-[var(--text)]">{example.label}</strong>
            </button>
          )
        })}
      </div>

      <div className="flex min-w-0 max-w-full justify-end max-[760px]:justify-start" id={`${groupId}-${activeExample.id}-panel`} role="tabpanel" aria-labelledby={`${groupId}-${activeExample.id}-tab`} tabIndex={0}>
        <CodeBlock code={activeExample.code} language={activeExample.language} label={activeExample.label} />
      </div>
    </div>
  )
}
