import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadIcon } from '../../../shared/components/icons/Icons'
import type { ConversionTool } from '../../tools/types'
import { FilePreview } from './FilePreview'

type Props = { file: File | null; tool: ConversionTool; onFileSelect: (file: File) => void; onRemove: () => void }

export function FileDropzone({ file, tool, onFileSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const chooseFile = () => inputRef.current?.click()
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (selected) onFileSelect(selected); event.target.value = '' }
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); const dropped = event.dataTransfer.files?.[0]; if (dropped) onFileSelect(dropped) }

  return <>{file ? <FilePreview file={file} onChange={chooseFile} onRemove={onRemove} /> : <div className={`dropzone ${isDragging ? 'is-dragging' : ''}`} onClick={chooseFile} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false) }} onDrop={handleDrop} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') chooseFile() }} role="button" tabIndex={0}><div className="upload-icon"><UploadIcon /></div><div><h2>Drop your {tool.from} file here</h2><p>or click to browse from your device</p></div><span className="choose-file">Choose file</span><span className="accepted-files">{tool.inputSuffixes.join(', ').toUpperCase()} · up to 50 MB</span></div>}<input ref={inputRef} className="sr-only" type="file" accept={tool.inputSuffixes.join(',')} onChange={handleInput} /></>
}
