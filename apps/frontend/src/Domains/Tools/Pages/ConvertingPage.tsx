import { useEffect, useState } from 'react'

import { FileIcon } from '../../../Shared/Components/Icons'
import { formatFileSize, getFileExtension } from '../../../Shared/Utils/file'

export function ConvertingPage({ file }: { file: File }) {
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(99, Math.round(8 + (elapsed / 2400) * 91)))
    }, 80)

    return () => window.clearInterval(timer)
  }, [])

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
          <span className="eyebrow">CONVERSION IN PROGRESS</span>
          <h1 id="conversion-title">Converting your file</h1>
          <p>Please keep this window open. This will only take a moment.</p>
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

