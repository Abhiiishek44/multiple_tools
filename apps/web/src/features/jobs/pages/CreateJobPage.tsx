import { LockIcon } from '../../../shared/components/icons/Icons'
import { PageContainer } from '../../../shared/components/layout/PageContainer'
import type { ConversionTool } from '../../tools/types'
import { FileDropzone } from '../components/FileDropzone'
import { ToolOptionsForm } from '../components/ToolOptionsForm'
import type { ToolOptions } from '../types'

type Props = { file: File | null; tool: ConversionTool; error: string | null; isSubmitting: boolean; onFileSelect: (file: File) => void; onRemove: () => void; onConvert: (options: ToolOptions) => void }

export function CreateJobPage({ file, tool, error, isSubmitting, onFileSelect, onRemove, onConvert }: Props) {
  return <PageContainer><section className="mx-auto w-full max-w-2xl" aria-labelledby="upload-title"><div className="mb-8 text-center max-sm:mb-6"><span className="mb-3 block text-xs font-extrabold tracking-[.14em] text-blue-600">{tool.from} CONVERTER</span><h1 className="text-4xl font-bold tracking-[-.045em] text-slate-900 max-sm:text-3xl" id="upload-title">Convert {tool.from} to {tool.to}</h1><p className="mt-3 text-base leading-7 text-slate-500">Upload your {tool.from} file to get started.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,.09)] max-sm:rounded-2xl max-sm:p-3"><FileDropzone file={file} tool={tool} onFileSelect={onFileSelect} onRemove={onRemove} /><ToolOptionsForm tool={tool} hasFile={Boolean(file)} isSubmitting={isSubmitting} error={error} onConvert={onConvert} /><div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500"><LockIcon className="size-4 fill-none stroke-blue-600 stroke-2" /><span>Private and secure — files are removed automatically after processing</span></div></div></section></PageContainer>
}
