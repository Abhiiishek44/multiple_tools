import type { ConversionTool } from './types'

type FormatConfig = { label: string; iconPath: string }
type ActionConfig = { label: string }

const ICON_ROOT = '/icons8'
const IMAGE_FILE_ICON = `${ICON_ROOT}/image-file.png`

const FORMATS: Record<string, FormatConfig> = {
  AVIF: { label: 'AVIF', iconPath: IMAGE_FILE_ICON },
  BMP: { label: 'BMP', iconPath: IMAGE_FILE_ICON },
  CSV: { label: 'CSV', iconPath: `${ICON_ROOT}/csv.png` },
  DOC: { label: 'DOC', iconPath: `${ICON_ROOT}/word.png` },
  DOCX: { label: 'DOC', iconPath: `${ICON_ROOT}/word.png` },
  EXCEL: { label: 'XLS', iconPath: `${ICON_ROOT}/xls.png` },
  HEIC: { label: 'HEIC', iconPath: IMAGE_FILE_ICON },
  HEIF: { label: 'HEIF', iconPath: IMAGE_FILE_ICON },
  HTM: { label: 'HTML', iconPath: `${ICON_ROOT}/html.png` },
  HTML: { label: 'HTML', iconPath: `${ICON_ROOT}/html.png` },
  IMAGE: { label: 'IMG', iconPath: IMAGE_FILE_ICON },
  JPEG: { label: 'JPG', iconPath: `${ICON_ROOT}/jpg.png` },
  JPG: { label: 'JPG', iconPath: `${ICON_ROOT}/jpg.png` },
  MARKDOWN: { label: 'MD', iconPath: `${ICON_ROOT}/markdown.png` },
  MD: { label: 'MD', iconPath: `${ICON_ROOT}/markdown.png` },
  PDF: { label: 'PDF', iconPath: `${ICON_ROOT}/pdf.png` },
  PNG: { label: 'PNG', iconPath: `${ICON_ROOT}/png.png` },
  POWERPOINT: { label: 'PPT', iconPath: `${ICON_ROOT}/ppt.png` },
  PPT: { label: 'PPT', iconPath: `${ICON_ROOT}/ppt.png` },
  PPTX: { label: 'PPT', iconPath: `${ICON_ROOT}/ppt.png` },
  TEXT: { label: 'TXT', iconPath: `${ICON_ROOT}/txt.png` },
  TIF: { label: 'TIF', iconPath: IMAGE_FILE_ICON },
  TIFF: { label: 'TIF', iconPath: IMAGE_FILE_ICON },
  TXT: { label: 'TXT', iconPath: `${ICON_ROOT}/txt.png` },
  WEBP: { label: 'WEBP', iconPath: IMAGE_FILE_ICON },
  WORD: { label: 'DOC', iconPath: `${ICON_ROOT}/word.png` },
  XLS: { label: 'XLS', iconPath: `${ICON_ROOT}/xls.png` },
  XLSX: { label: 'XLS', iconPath: `${ICON_ROOT}/xls.png` },
  ZIP: { label: 'ZIP', iconPath: `${ICON_ROOT}/zip.png` },
}

const ACTIONS: Record<string, ActionConfig> = {
  'compress-pdf': { label: 'CMP' },
  'protect-pdf': { label: 'LOCK' },
  'rotate-pdf': { label: 'ROT' },
  'unlock-pdf': { label: 'OPEN' },
}

export const TOOL_ICON_CONFIG = { formats: FORMATS, actions: ACTIONS }

export type ResolvedToolIcon = {
  iconPath: string
  targetLabel: string
}

export function getToolIconConfig(tool: ConversionTool): ResolvedToolIcon {
  const source = formatConfig(tool.inputFormats[0] || tool.from)
  const target = formatConfig(tool.outputFormats[0] || tool.to)
  const action = ACTIONS[tool.id]

  return {
    iconPath: source.iconPath,
    targetLabel: action?.label || target.label,
  }
}

function formatConfig(value: string): FormatConfig {
  const normalized = value.trim().toUpperCase().split(/[\s,/]+/, 1)[0]
  return FORMATS[normalized] || { label: normalized.slice(0, 4) || 'FILE', iconPath: IMAGE_FILE_ICON }
}
