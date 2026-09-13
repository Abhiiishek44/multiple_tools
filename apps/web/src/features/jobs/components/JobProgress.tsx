import { FileIcon } from '../../../shared/components/icons/Icons'
import { formatFileSize, getFileExtension } from '../../../shared/utils/file'
import type { ConversionJob } from '../types'

export function JobProgress({ file, job }: { file: File | null; job: ConversionJob }) {
  const progress = Math.max(job.status === 'QUEUED' ? 4 : 8, Math.min(99, job.progress))
  const filename = file?.name || job.input_filename
  return <section className="progress-state"><div className="progress-ring" role="progressbar" aria-label="Conversion progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" /><circle className="progress-value" cx="60" cy="60" r="52" strokeDashoffset={327 - (327 * progress) / 100} /></svg><div><strong>{progress}</strong><span>%</span></div></div><p className="eyebrow">{job.status === 'QUEUED' ? 'Waiting for a worker' : 'Conversion in progress'}</p><h2 id="conversion-title">{job.status === 'QUEUED' ? 'Your file is queued' : 'Converting your file'}</h2><p>Job {job.id.slice(0, 8)} · This page updates automatically.</p><div className="progress-file"><div><FileIcon /></div><span><strong title={filename}>{filename}</strong><small>{file ? `${getFileExtension(file)} · ${formatFileSize(file.size)}` : 'Stored in backend'}</small></span><i aria-hidden="true" /></div></section>
}
