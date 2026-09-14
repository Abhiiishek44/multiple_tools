import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadIcon } from '../../../shared/components/icons/Icons'
import type { ConversionTool } from '../../tools/types'
import { FilePreview } from './FilePreview'
import { cn } from '../../../shared/styles'

type Props = { file: File | null; tool: ConversionTool; onFileSelect: (file: File) => void; onRemove: () => void }

export function FileDropzone({ file, tool, onFileSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const chooseFile = () => inputRef.current?.click()
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (selected) onFileSelect(selected); event.target.value = '' }
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); const dropped = event.dataTransfer.files?.[0]; if (dropped) onFileSelect(dropped) }

  return <>{file ? <FilePreview file={file} onChange={chooseFile} onRemove={onRemove} /> : <div className={cn('flex min-h-[330px] cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-[30px] text-center transition-[border-color,transform,background] hover:scale-[.997] hover:border-[var(--accent-strong)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))] max-[700px]:min-h-[300px]', isDragging && 'scale-[.997] border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))]')} onClick={chooseFile} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false) }} onDrop={handleDrop} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') chooseFile() }} role="button" tabIndex={0}><div className="grid size-14 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)] [&_svg]:size-[25px]"><UploadIcon /></div><div><h2 className="mb-0 mt-[5px] text-base">Drop your {tool.from} file here</h2><p className="mb-0 mt-[7px] text-xs text-[var(--faint)]">or click to browse from your device</p></div><span className="inline-flex min-h-[38px] items-center rounded-xl bg-[var(--accent)] px-[18px] text-[11px] font-[750] text-[var(--accent-text)]">Choose file</span><span className="mt-0.5 text-[9px] text-[var(--faint)]">{tool.inputSuffixes.join(', ').toUpperCase()} · up to 50 MB</span></div>}<input ref={inputRef} className="sr-only" type="file" accept={tool.inputSuffixes.join(',')} onChange={handleInput} /></>
}
