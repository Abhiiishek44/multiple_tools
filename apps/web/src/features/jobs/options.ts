import type { ToolOptions } from './types'

type OptionValues = { angle: string; password: string; ownerPassword: string }

export function toolNeedsPassword(toolName: string) {
  return toolName === 'protect-pdf' || toolName === 'unlock-pdf'
}

export function buildToolOptions(toolName: string, values: OptionValues): ToolOptions {
  if (toolName === 'rotate-pdf') return { angle: Number(values.angle) }
  if (toolName === 'unlock-pdf') return { password: values.password }
  if (toolName === 'protect-pdf') return { password: values.password, ...(values.ownerPassword ? { owner_password: values.ownerPassword } : {}) }
  return {}
}
