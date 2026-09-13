import type { ConversionTool } from '../types'

const FORMAT_MARKS: Record<string, string> = {
  WORD: 'DOC', DOCX: 'DOC', EXCEL: 'XLS', XLSX: 'XLS', POWERPOINT: 'PPT', PPTX: 'PPT',
  TEXT: 'TXT', MARKDOWN: 'MD', TIFF: 'TIF', WEBP: 'WEB', AVIF: 'AVI', HEIC: 'HEI', IMAGE: 'IMG',
}

function formatMark(value: string) {
  const upper = value.toUpperCase()
  return FORMAT_MARKS[upper] || upper.slice(0, 3)
}

function FormatGlyph({ format }: { format: string }) {
  const mark = formatMark(format)

  if (mark === 'PDF') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4" /><path d="M9 16c2.3-3.8 3.5-6.6 3.1-8.3M9.2 14.8c2.8-.8 4.9-.7 6.3.2M10.8 10.6c.8 2.2 1.9 3.7 3.4 4.5" /></svg>
  if (mark === 'DOC') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4" /><path d="m9 11 1.4 6 1.6-4 1.6 4L15 11" /></svg>
  if (mark === 'XLS') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M10 9v12M10 15h10M6.5 12l2 5m0-5-2 5" /></svg>
  if (mark === 'PPT') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8M12 18v3M8 8h3a2 2 0 0 1 0 4H8zm7 0v5M15 8h3" /></svg>
  if (mark === 'CSV') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18M9 9v11M15 9v11" /></svg>
  if (mark === 'HTM') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" /></svg>
  if (mark === 'TXT') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" /></svg>
  if (mark === 'MD') return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M6 15V9l3 3 3-3v6m4-6v6m-2-2 2 2 2-2" /></svg>
  return <svg className="tool-format-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg>
}

function ActionMark({ action }: { action: 'compress' | 'rotate' | 'protect' | 'unlock' }) {
  if (action === 'compress') return <svg className="tool-action-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5" /><path d="m9 9-4-4m10 4 4-4m-10 10-4 4m10-4 4 4" /></svg>
  if (action === 'rotate') return <svg className="tool-action-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 1-2-5" /></svg>
  if (action === 'protect') return <svg className="tool-action-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" /><rect x="9" y="10" width="6" height="5" rx="1" /><path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10" /></svg>
  return <svg className="tool-action-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M9 10V7a3 3 0 0 1 5.7-1.3M12 14v2" /></svg>
}

export function ToolVisual({ tool }: { tool: ConversionTool }) {
  const action = tool.id.match(/^(compress|rotate|protect|unlock)-/)?.[1] as 'compress' | 'rotate' | 'protect' | 'unlock' | undefined
  if (action) return <span className="format-icon tool-action-icon"><ActionMark action={action} /></span>

  return (
    <span className="format-icon tool-format-logo">
      <FormatGlyph format={tool.to} />
      <i>{formatMark(tool.from)}</i>
      <small>{formatMark(tool.to)}</small>
    </span>
  )
}
