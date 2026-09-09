import { FileIcon } from '../../../shared/components/icons/Icons'
import { formatFileSize, getFileExtension } from '../../../shared/utils/file'

type Props = { file: File; onChange: () => void; onRemove: () => void }

export function FilePreview({ file, onChange, onRemove }: Props) {
  return <div className="flex min-h-40 items-center rounded-2xl border border-blue-200 bg-blue-50/60 p-6 max-sm:min-h-32 max-sm:p-4" aria-live="polite"><div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-md"><FileIcon className="size-7 fill-none stroke-current stroke-[1.7]" /></div><div className="mx-4 min-w-0 flex-1 max-sm:mx-3"><p className="truncate text-sm font-bold text-slate-900" title={file.name}>{file.name}</p><p className="mt-1 flex items-center gap-2 text-xs text-slate-500">{getFileExtension(file)} <span className="size-1 rounded-full bg-slate-300" /> {formatFileSize(file.size)}</p></div><div className="flex items-center gap-2"><button className="bg-transparent px-2 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 max-sm:hidden" type="button" onClick={onChange}>Change</button><button className="grid size-9 place-items-center rounded-lg bg-white/80 text-slate-500 transition hover:bg-red-50 hover:text-red-600" type="button" onClick={onRemove} aria-label="Remove file"><svg className="size-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg></button></div></div>
}
