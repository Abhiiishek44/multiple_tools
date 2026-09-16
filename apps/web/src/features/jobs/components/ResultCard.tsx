import { Alert } from '../../../shared/components/ui/Alert'
import { CheckIcon, DownloadIcon, FileIcon } from '../../../shared/components/icons/Icons'
import { getConvertedFileName } from '../../../shared/utils/file'
import type { ConversionTool } from '../../tools/types'
import type { ConversionJob } from '../types'
import { primaryAction, secondaryAction } from '../../../shared/styles'

type Props = { file: File | null; tool: ConversionTool; job: ConversionJob; error: string | null; onDownload: () => void; onRestart: () => void }

export function ResultCard({ file, tool, job, error, onDownload, onRestart }: Props) {
  const filename = job.output_filename || getConvertedFileName(file?.name || job.input_filename, tool.outputSuffix.slice(1))
  return (
    <section className="mx-auto max-w-[620px] px-5 pb-8 pt-10 text-center">
      <div className="success-mark mx-auto mb-5 grid size-14 place-items-center rounded-full border border-[color-mix(in_srgb,#22a866_28%,var(--border))] bg-[color-mix(in_srgb,#22a866_10%,var(--surface))]">
        <span className="success-mark-ring absolute size-14 rounded-full border border-[#22a866]/30" aria-hidden="true" />
        <img className="success-mark-icon size-7" src="/icons8/success-check.png" alt="" aria-hidden="true" />
      </div>
      <h2 className="m-0 text-[clamp(30px,4vw,38px)] font-[800] leading-[1.08] tracking-[-.045em]" id="result-title">Your file is ready</h2>
      <p className="mx-auto mb-0 mt-3 max-w-[470px] text-sm leading-[1.6] text-[var(--muted)]">The conversion finished successfully and your download has started.</p>
      <div className="mt-7 flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:size-5"><FileIcon /></div>
        <span className="ml-3 min-w-0 flex-1"><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[var(--text)]" title={filename}>{filename}</strong><small className="mt-1 block text-[11px] text-[var(--muted)]">{tool.outputSuffix.slice(1).toUpperCase()} output file</small></span>
        <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,#22a866_30%,var(--border))] bg-[color-mix(in_srgb,#22a866_10%,var(--surface))] px-2.5 text-[11px] font-semibold text-[#168a53] [&_svg]:size-3.5 [&_svg]:stroke-[2.5]"><CheckIcon />Ready</span>
      </div>
      <div className="mt-3 grid gap-2.5">{error && <Alert>{error}</Alert>}<button className={primaryAction} type="button" onClick={onDownload}><DownloadIcon />Download again</button><button className={secondaryAction} type="button" onClick={onRestart}>Convert another file</button></div>
    </section>
  )
}
