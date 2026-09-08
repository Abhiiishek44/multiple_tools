import { FileIcon } from '../../../Shared/Components/Icons'
import { formatFileSize, getFileExtension } from '../../../Shared/Utils/file'
import type { ConversionJob } from '../api/conversion'

export function ConvertingPage({ file, job }: { file: File; job: ConversionJob }) {
  const progress = Math.max(job.status === 'QUEUED' ? 4 : 8, Math.min(99, job.progress))

  return (
    <main className="page page--centered" aria-labelledby="conversion-title">
      <section className="status-card status-card--loading">
        <div className="loader" role="progressbar" aria-label="Conversion progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="loader__track" cx="60" cy="60" r="52" />
            <circle className="loader__progress" cx="60" cy="60" r="52" style={{ strokeDashoffset: 327 - (327 * progress) / 100 }} />
          </svg>
          <div className="loader__value"><strong>{progress}</strong><span>%</span></div>
        </div>
        <div className="status-copy">
          <span className="eyebrow">{job.status === 'QUEUED' ? 'WAITING FOR A WORKER' : 'CONVERSION IN PROGRESS'}</span>
          <h1 id="conversion-title">{job.status === 'QUEUED' ? 'Your file is queued' : 'Converting your file'}</h1>
          <p>Job {job.id.slice(0, 8)} · You can keep this window open while the backend processes it.</p>
        </div>
        <div className="compact-file">
          <div className="compact-file__icon"><FileIcon /></div>
          <div>
            <strong title={file.name}>{file.name}</strong>
            <span>{getFileExtension(file)} · {formatFileSize(file.size)}</span>
          </div>
          <span className="processing-dot" aria-hidden="true" />
        </div>
      </section>
    </main>
  )
}

