import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

import { FileIcon, LockIcon, UploadIcon } from '../../../Shared/Components/Icons'
import { formatFileSize, getFileExtension } from '../../../Shared/Utils/file'
import type { ConversionTool } from '../components/ToolCatalog'

type UploadPageProps = {
  file: File | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  onConvert: () => void
  tool: ConversionTool
}

export function UploadPage({ file, onFileSelect, onRemove, onConvert, tool }: UploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) onFileSelect(selectedFile)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) onFileSelect(droppedFile)
  }

  return (
    <main className="page page--upload" aria-labelledby="upload-title">
      <section className="upload-shell">
        <div className="page-heading">
          <span className="eyebrow">{tool.from} CONVERTER</span>
          <h1 id="upload-title">Convert {tool.from} to {tool.to}</h1>
          <p>Upload your {tool.from} file to get started.</p>
        </div>

        <div className="upload-card">
          {!file ? (
            <div
              className={`drop-zone${isDragging ? ' drop-zone--active' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false)
              }}
              onDrop={handleDrop}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
              }}
              role="button"
              tabIndex={0}
            >
              <div className="upload-icon"><UploadIcon /></div>
              <div className="drop-zone__copy">
                <h2>Drag and drop your file here</h2>
                <p>or <span>browse from your device</span></p>
              </div>
              <span className="file-support">All common file types supported</span>
            </div>
          ) : (
            <div className="selected-file" aria-live="polite">
              <div className="selected-file__icon"><FileIcon /></div>
              <div className="selected-file__details">
                <p className="selected-file__name" title={file.name}>{file.name}</p>
                <p className="selected-file__meta">{getFileExtension(file)} <span /> {formatFileSize(file.size)}</p>
              </div>
              <div className="selected-file__actions">
                <button className="text-button" type="button" onClick={() => inputRef.current?.click()}>Change</button>
                <button className="icon-button" type="button" onClick={onRemove} aria-label="Remove file">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
                </button>
              </div>
            </div>
          )}

          <input ref={inputRef} className="visually-hidden" type="file" onChange={handleInput} />
          <button className="primary-button" type="button" onClick={onConvert} disabled={!file}>
            Convert file
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
          </button>
          <div className="privacy-note"><LockIcon /><span>Private by design — your file is processed locally</span></div>
        </div>
      </section>
    </main>
  )
}
