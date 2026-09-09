import { CheckIcon, DownloadIcon, FileIcon } from '../../../Shared/Components/Icons'

import { formatFileSize, getConvertedFileName } from '../../../Shared/Utils/file'
import type { ConversionJob, ConversionTool } from '../api/conversion'

type ResultPageProps = {
  file: File
  onDownload: () => void
  onRestart: () => void
  tool: ConversionTool
  job: ConversionJob
  error: string | null
}

export function ResultPage({ file, onDownload, onRestart, tool, job, error }: ResultPageProps) {
  const convertedFileName = job.output_filename || getConvertedFileName(file.name, tool.outputSuffix.slice(1))

  return (
    <main className="page page--centered" aria-labelledby="result-title">
      <section className="status-card status-card--result">
        <div className="success-mark"><CheckIcon /></div>
        <div className="status-copy">
          <span className="eyebrow eyebrow--success">CONVERSION COMPLETE</span>
          <h1 id="result-title">Your file is ready</h1>
          <p>The file was converted successfully and is ready to download.</p>
        </div>
        <div className="result-file">
          <div className="result-file__icon"><FileIcon /></div>
          <div className="result-file__details">
            <strong title={convertedFileName}>{convertedFileName}</strong>
            <span>{tool.outputSuffix.slice(1).toUpperCase()} <i /> {formatFileSize(file.size)}</span>
          </div>
          <span className="ready-badge"><CheckIcon /> Ready</span>
        </div>
        <div className="result-actions">
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button" type="button" onClick={onDownload}><DownloadIcon />Download file</button>
          <button className="secondary-button" type="button" onClick={onRestart}>Convert another file</button>
        </div>
      </section>
    </main>
  )
}
