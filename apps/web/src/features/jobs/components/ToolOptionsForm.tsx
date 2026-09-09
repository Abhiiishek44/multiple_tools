import { useState } from 'react'
import { Alert } from '../../../shared/components/ui/Alert'
import type { ConversionTool } from '../../tools/types'
import { buildToolOptions, toolNeedsPassword } from '../options'
import type { ToolOptions } from '../types'

type Props = { tool: ConversionTool; hasFile: boolean; isSubmitting: boolean; error: string | null; onConvert: (options: ToolOptions) => void }

export function ToolOptionsForm({ tool, hasFile, isSubmitting, error, onConvert }: Props) {
  const [password, setPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [angle, setAngle] = useState('90')
  const needsPassword = toolNeedsPassword(tool.id)

  return <>{tool.id === 'rotate-pdf' && <label className="mt-4 flex flex-col gap-2 text-xs font-bold text-slate-600"><span>Rotation angle</span><select className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={angle} onChange={(event) => setAngle(event.target.value)}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option><option value="-90">90° counter-clockwise</option></select></label>}{needsPassword && <div className="mt-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><label className="flex flex-col gap-2 text-xs font-bold text-slate-600"><span>{tool.id === 'protect-pdf' ? 'New PDF password' : 'Current PDF password'}</span><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="password" value={password} maxLength={127} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></label>{tool.id === 'protect-pdf' && <label className="flex flex-col gap-2 text-xs font-bold text-slate-600"><span>Owner password <small className="ml-1 font-medium text-slate-400">Optional</small></span><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="password" value={ownerPassword} maxLength={127} onChange={(event) => setOwnerPassword(event.target.value)} placeholder="Defaults to the PDF password" /></label>}</div>}{error && <Alert className="mt-4 text-xs leading-5">{error}</Alert>}<button className="mt-4 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-px hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none" type="button" onClick={() => onConvert(buildToolOptions(tool.id, { angle, password, ownerPassword }))} disabled={!hasFile || isSubmitting || (needsPassword && !password)}>{isSubmitting ? 'Starting conversion…' : 'Convert file'}<svg className="size-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></button></>
}
