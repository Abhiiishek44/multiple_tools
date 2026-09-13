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

  return <div className="tool-options">{tool.id === 'rotate-pdf' && <label><span>Rotation angle</span><select value={angle} onChange={(event) => setAngle(event.target.value)}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option><option value="-90">90° counter-clockwise</option></select></label>}{needsPassword && <div className="option-grid"><label><span>{tool.id === 'protect-pdf' ? 'New PDF password' : 'Current PDF password'}</span><input type="password" value={password} maxLength={127} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></label>{tool.id === 'protect-pdf' && <label><span>Owner password <small>Optional</small></span><input type="password" value={ownerPassword} maxLength={127} onChange={(event) => setOwnerPassword(event.target.value)} placeholder="Defaults to the PDF password" /></label>}</div>}{error && <Alert>{error}</Alert>}<button className="primary-action" type="button" onClick={() => onConvert(buildToolOptions(tool.id, { angle, password, ownerPassword }))} disabled={!hasFile || isSubmitting || (needsPassword && !password)}>{isSubmitting ? 'Starting conversion…' : `Convert to ${tool.to}`}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></button></div>
}
