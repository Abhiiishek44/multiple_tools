import { useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import type { ConversionTool, ToolOption } from '../../tools/types'
import type { ToolOptions } from '../types'
import { eyebrow, primaryAction } from '../../../shared/styles'

type Props = { tool: ConversionTool; hasFile: boolean; isSubmitting: boolean; error: string | null; onConvert: (options: ToolOptions) => void }

function initialValues(tool: ConversionTool) {
  return Object.fromEntries(tool.options.map((option) => [option.name, option.default ?? '']))
}

function optionValue(option: ToolOption, raw: string) {
  return option.choices.find((choice) => String(choice.value) === raw)?.value ?? raw
}

export function ToolOptionsForm({ tool, hasFile, isSubmitting, error, onConvert }: Props) {
  const [values, setValues] = useState<Record<string, string | number>>(() => initialValues(tool))
  const setValue = (name: string, value: string | number) => setValues((current) => ({ ...current, [name]: value }))
  const requiredMissing = tool.options.some((option) => option.required && !String(values[option.name] ?? '').trim())
  const submit = () => {
    const options = Object.fromEntries(tool.options.flatMap((option) => {
      const raw = String(values[option.name] ?? '')
      return raw ? [[option.name, optionValue(option, raw)]] : []
    }))
    onConvert(options)
  }

  return <div className="grid gap-3 pt-3">
    {tool.options.length > 0 && <div className="grid grid-cols-2 gap-2.5 max-[700px]:grid-cols-1">{tool.options.map((option) => <label className="flex flex-col gap-[7px] text-[10px] font-bold text-[var(--muted)]" key={option.name}>
      <span>{option.label}{!option.required && <small className={`ml-1 ${eyebrow}`}>Optional</small>}</span>
      {option.type === 'select' ? <select className="min-h-[42px] rounded-[11px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text)] outline-0" value={String(values[option.name] ?? '')} onChange={(event) => setValue(option.name, event.target.value)}>{option.choices.map((choice) => <option value={String(choice.value)} key={String(choice.value)}>{choice.label}</option>)}</select> : <input className="min-h-[42px] rounded-[11px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text)] outline-0" type={option.type} value={String(values[option.name] ?? '')} required={option.required} maxLength={127} onChange={(event) => setValue(option.name, event.target.value)} />}
      {option.description && <small className="font-medium text-[var(--faint)]">{option.description}</small>}
    </label>)}</div>}
    {error && <Alert>{error}</Alert>}
    <button className={primaryAction} type="button" onClick={submit} disabled={!hasFile || isSubmitting || requiredMissing}>{isSubmitting ? 'Uploading file…' : error && hasFile ? 'Retry conversion' : `Convert to ${tool.to}`}<svg className={isSubmitting ? 'animate-spin' : ''} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></button>
  </div>
}
