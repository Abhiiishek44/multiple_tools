import { CheckIcon, DownloadIcon, FileIcon } from '../../../Shared/Components/Icons'

import { formatFileSize, getConvertedFileName } from '../../../Shared/Utils/file'
import type { ConversionTool } from '../components/ToolCatalog'

type ResultPageProps = {
  file: File
  onDownload: () => void
  onRestart: () => void
  tool: ConversionTool
}

export function ResultPage({ file, onDownload, onRestart, tool }: ResultPageProps) {
  const convertedFileName = getConvertedFileName(file.name, tool.to)

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
            <span>{tool.to} <i /> {formatFileSize(file.size)}</span>
          </div>
          <span className="ready-badge"><CheckIcon /> Ready</span>
        </div>
        <div className="result-actions">
          <button className="primary-button" type="button" onClick={onDownload}><DownloadIcon />Download file</button>
          <button className="secondary-button" type="button" onClick={onRestart}>Convert another file</button>
        </div>
      </section>
    </main>
  )
}
