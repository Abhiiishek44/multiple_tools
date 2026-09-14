import { Alert } from '../../../shared/components/ui/Alert'
import { CheckIcon, DownloadIcon, FileIcon } from '../../../shared/components/icons/Icons'
import { getConvertedFileName } from '../../../shared/utils/file'
import type { ConversionTool } from '../../tools/types'
import type { ConversionJob } from '../types'
import { eyebrow, primaryAction, secondaryAction } from '../../../shared/styles'

type Props = { file: File | null; tool: ConversionTool; job: ConversionJob; error: string | null; onDownload: () => void; onRestart: () => void }

export function ResultCard({ file, tool, job, error, onDownload, onRestart }: Props) {
  const filename = job.output_filename || getConvertedFileName(file?.name || job.input_filename, tool.outputSuffix.slice(1))
  return <section className="mx-auto max-w-[590px] px-5 pb-7 pt-[42px] text-center"><div className="mx-auto mb-6 grid size-[70px] place-items-center rounded-full bg-[color-mix(in_srgb,#21aa69_12%,var(--surface))] text-[#21aa69] [&_svg]:size-8 [&_svg]:stroke-[2.5]"><CheckIcon /></div><p className={`${eyebrow} text-[#21aa69]`}>Conversion complete</p><h2 className="m-0 text-[31px] tracking-[-.04em]" id="result-title">Your file is ready</h2><p className="text-xs leading-relaxed text-[var(--muted)]">The conversion finished successfully. Download the result below.</p><div className="mt-6 flex items-center rounded-[14px] bg-[var(--surface)] p-[13px] text-left"><div className="grid size-[42px] place-items-center rounded-[11px] bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:size-5"><FileIcon /></div><span className="ml-[11px] min-w-0 flex-1"><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[var(--text)]" title={filename}>{filename}</strong><small className="mt-[3px] block text-[9px] text-[var(--muted)]">{tool.outputSuffix.slice(1).toUpperCase()} · Backend output</small></span><i className="inline-flex items-center gap-1 text-[9px] font-bold not-italic text-[#21aa69] [&_svg]:w-3"><CheckIcon /> Ready</i></div><div className="mt-[15px] grid gap-[9px]">{error && <Alert>{error}</Alert>}<button className={primaryAction} type="button" onClick={onDownload}><DownloadIcon />Download file</button><button className={secondaryAction} type="button" onClick={onRestart}>Convert another file</button></div></section>
}
