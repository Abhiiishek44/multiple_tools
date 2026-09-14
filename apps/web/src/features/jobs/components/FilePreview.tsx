import { FileIcon } from '../../../shared/components/icons/Icons'
import { formatFileSize, getFileExtension } from '../../../shared/utils/file'

type Props = { file: File; onChange: () => void; onRemove: () => void }

export function FilePreview({ file, onChange, onRemove }: Props) {
  return <div className="flex min-h-[150px] items-center rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-[22px]" aria-live="polite"><div className="grid size-12 shrink-0 place-items-center rounded-[13px] bg-[var(--accent)] text-[var(--accent-text)] [&_svg]:w-[22px]"><FileIcon /></div><div className="mx-[15px] min-w-0 flex-1"><p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-[750]" title={file.name}>{file.name}</p><span className="mt-[5px] block text-[10px] text-[var(--muted)]">{getFileExtension(file)} · {formatFileSize(file.size)}</span></div><div className="flex gap-1.5 [&_button]:min-h-[34px] [&_button]:cursor-pointer [&_button]:rounded-[10px] [&_button]:border-0 [&_button]:bg-[var(--surface-soft)] [&_button]:px-[11px] [&_button]:text-[10px] [&_button]:font-bold [&_button]:text-[var(--muted)] [&_button:last-child]:w-[34px] [&_button:last-child]:px-0 [&_button:last-child]:text-lg"><button type="button" onClick={onChange}>Change</button><button type="button" onClick={onRemove} aria-label="Remove file">×</button></div></div>
}
