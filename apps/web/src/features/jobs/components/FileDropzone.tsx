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

  return <>{file ? <FilePreview file={file} onChange={chooseFile} onRemove={onRemove} /> : <div className={`flex min-h-72 cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-8 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-blue-100 max-sm:min-h-64 max-sm:p-5 ${isDragging ? 'scale-[.992] border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50'}`} onClick={chooseFile} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false) }} onDrop={handleDrop} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') chooseFile() }} role="button" tabIndex={0}><div className="grid size-16 place-items-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-lg shadow-blue-100"><UploadIcon className="size-7 fill-none stroke-current stroke-[1.7]" /></div><div><h2 className="text-base font-bold text-slate-900">Drag and drop your file here</h2><p className="mt-2 text-sm text-slate-500">or <span className="font-semibold text-blue-600">browse from your device</span></p></div><span className="text-xs text-slate-500">Accepted: {tool.inputSuffixes.join(', ').toUpperCase()} · Maximum 50 MB</span></div>}<input ref={inputRef} className="sr-only" type="file" accept={tool.inputSuffixes.join(',')} onChange={handleInput} /></>
}
