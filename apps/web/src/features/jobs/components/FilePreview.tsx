import { FileIcon } from '../../../shared/components/icons/Icons'
import { formatFileSize, getFileExtension } from '../../../shared/utils/file'

type Props = { file: File; onChange: () => void; onRemove: () => void }

export function FilePreview({ file, onChange, onRemove }: Props) {
  return <div className="file-preview" aria-live="polite"><div className="file-preview-icon"><FileIcon /></div><div className="file-preview-copy"><p title={file.name}>{file.name}</p><span>{getFileExtension(file)} · {formatFileSize(file.size)}</span></div><div className="file-preview-actions"><button type="button" onClick={onChange}>Change</button><button type="button" onClick={onRemove} aria-label="Remove file">×</button></div></div>
}
