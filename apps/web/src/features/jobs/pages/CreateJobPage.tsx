import type { ConversionTool } from '../../tools/types'
import { FileDropzone } from '../components/FileDropzone'
import { ToolOptionsForm } from '../components/ToolOptionsForm'
import type { ToolOptions } from '../types'

type Props = { file: File | null; tool: ConversionTool; error: string | null; isSubmitting: boolean; onFileSelect: (file: File) => void; onRemove: () => void; onConvert: (options: ToolOptions) => void }

export function CreateJobPage({ file, tool, error, isSubmitting, onFileSelect, onRemove, onConvert }: Props) {
  return <section aria-label={`Upload a file for ${tool.name}`}><FileDropzone file={file} tool={tool} onFileSelect={onFileSelect} onRemove={onRemove} /><ToolOptionsForm tool={tool} hasFile={Boolean(file)} isSubmitting={isSubmitting} error={error} onConvert={onConvert} /></section>
}
