import type { ConversionTool } from '../types'

const formatColors: Record<string, string> = {
  PDF: 'bg-red-500', DOC: 'bg-blue-600', DOCX: 'bg-blue-600', XLSX: 'bg-emerald-600', CSV: 'bg-emerald-600',
  PPTX: 'bg-orange-500', TXT: 'bg-slate-600', HTML: 'bg-amber-500', MD: 'bg-violet-600', JPG: 'bg-pink-500',
  PNG: 'bg-cyan-500', HEIC: 'bg-indigo-500', IMG: 'bg-fuchsia-500', AVIF: 'bg-purple-500', WEBP: 'bg-teal-500',
  BMP: 'bg-lime-600', TIFF: 'bg-sky-600',
}

function FormatMark({ format }: { format: string }) {
  if (['JPG', 'PNG', 'HEIC', 'IMG', 'AVIF', 'WEBP', 'BMP', 'TIFF'].includes(format)) return <svg className="absolute inset-x-0 top-5 mx-auto h-5 w-7 fill-none stroke-white stroke-[1.8]" viewBox="0 0 24 20"><circle cx="17.5" cy="5" r="2" /><path d="m3 17 5.5-6 3.5 3.5 2.5-2.5 6.5 5" /></svg>
  if (format === 'TXT') return <svg className="absolute inset-x-0 top-5 mx-auto h-5 w-7 fill-none stroke-white stroke-[1.8]" viewBox="0 0 24 20"><path d="M4 4h16M4 8h16M4 12h12M4 16h9" /></svg>
  if (format === 'PDF') return <svg className="absolute inset-x-0 top-5 mx-auto h-5 w-7 fill-none stroke-white stroke-[1.8]" viewBox="0 0 24 20"><path d="M6 16c4-5 6-10 6-13 0 7 2 11 6 14-5-3-10-2-14 0 4-1 10-2 16-2" /></svg>
  const letter = format === 'DOCX' ? 'W' : format === 'XLSX' ? 'X' : format === 'PPTX' ? 'P' : format.slice(0, 1)
  return <span className="absolute inset-x-0 top-4 text-center text-xl font-black text-white">{letter}</span>
}

function FileBadge({ format }: { format: string }) {
  return <span className={`relative block h-[4.5rem] w-14 shrink-0 [clip-path:polygon(0_0,72%_0,100%_22%,100%_100%,0_100%)] text-white drop-shadow-md ${formatColors[format] || 'bg-slate-600'}`}><svg className="absolute inset-0 size-full fill-none stroke-white/35" viewBox="0 0 48 58" aria-hidden="true"><path d="M29 2.5v9.75c0 .7.55 1.25 1.25 1.25H40" /></svg><FormatMark format={format} /><strong className="absolute inset-x-1 bottom-2 truncate text-center text-[9px] font-extrabold tracking-wide" title={format}>{format}</strong></span>
}

function ConversionArrow({ reverse = false }: { reverse?: boolean }) {
  return <span className={`text-slate-400 ${reverse ? 'rotate-180' : ''}`}><svg className="size-7 fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24"><path d="M5 12h13m-4-4 4 4-4 4" /></svg></span>
}

export function ToolVisual({ tool }: { tool: ConversionTool }) {
  const layout = 'flex items-center justify-center gap-3'
  if (tool.id === 'compress-pdf') return <span className={layout}><ConversionArrow /><FileBadge format="PDF" /><ConversionArrow reverse /></span>
  if (tool.id === 'image-to-text') return <span className={layout}><FileBadge format="IMG" /><ConversionArrow /><span className="grid size-14 place-items-center rounded-xl border-2 border-dashed border-slate-400 bg-white text-2xl font-black text-slate-700 shadow-sm">T</span></span>
  return <span className={layout}><FileBadge format={tool.from} /><ConversionArrow /><FileBadge format={tool.to} /></span>
}
