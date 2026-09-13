import { Alert } from '../../../shared/components/ui/Alert'
import { CheckIcon, DownloadIcon, FileIcon } from '../../../shared/components/icons/Icons'
import { getConvertedFileName } from '../../../shared/utils/file'
import type { ConversionTool } from '../../tools/types'
import type { ConversionJob } from '../types'

type Props = { file: File | null; tool: ConversionTool; job: ConversionJob; error: string | null; onDownload: () => void; onRestart: () => void }

export function ResultCard({ file, tool, job, error, onDownload, onRestart }: Props) {
  const filename = job.output_filename || getConvertedFileName(file?.name || job.input_filename, tool.outputSuffix.slice(1))
  return <section className="result-state"><div className="success-icon"><CheckIcon /></div><p className="eyebrow">Conversion complete</p><h2 id="result-title">Your file is ready</h2><p>The conversion finished successfully. Download the result below.</p><div className="result-file"><div><FileIcon /></div><span><strong title={filename}>{filename}</strong><small>{tool.outputSuffix.slice(1).toUpperCase()} · Backend output</small></span><i><CheckIcon /> Ready</i></div><div className="result-actions">{error && <Alert>{error}</Alert>}<button className="primary-action" type="button" onClick={onDownload}><DownloadIcon />Download file</button><button className="secondary-action" type="button" onClick={onRestart}>Convert another file</button></div></section>
}
