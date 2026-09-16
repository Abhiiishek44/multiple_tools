import { cn } from '../../../shared/styles'
import { getToolIconConfig } from '../toolIconConfig'
import type { ConversionTool } from '../types'

type Size = 'small' | 'medium' | 'large'

const SIZE_CLASSES: Record<Size, { shell: string; badge: string; target: string }> = {
  small: {
    shell: 'size-10',
    badge: 'h-3.5 min-w-6 rounded px-1 text-[7px]',
    target: '-bottom-1 -right-2',
  },
  medium: {
    shell: 'size-[52px]',
    badge: 'h-[18px] min-w-7 rounded-[5px] px-1.5 text-[8px]',
    target: '-bottom-1 -right-2',
  },
  large: {
    shell: 'size-[70px]',
    badge: 'h-5 min-w-8 rounded-md px-2 text-[9px]',
    target: '-bottom-1 -right-2',
  },
}

export function ToolIcon({ tool, size = 'medium', className }: { tool: ConversionTool; size?: Size; className?: string }) {
  const config = getToolIconConfig(tool)
  const classes = SIZE_CLASSES[size]

  return (
    <span
      className={cn(
        classes.shell,
        'relative isolate block shrink-0',
        className,
      )}
      aria-hidden="true"
    >
      <img className="block size-full object-contain drop-shadow-[0_4px_8px_rgba(20,24,20,.12)]" src={config.iconPath} alt="" loading="lazy" />
      <FormatBadge className={cn(classes.badge, classes.target)} label={config.targetLabel} />
    </span>
  )
}

function FormatBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn(
      className,
      'absolute z-1 grid place-items-center border-2 border-[var(--surface)] bg-[var(--accent)] font-sans font-black leading-none tracking-[.02em] text-[var(--accent-text)] shadow-[0_2px_6px_rgba(0,0,0,.3)]',
    )}>
      {label}
    </span>
  )
}
