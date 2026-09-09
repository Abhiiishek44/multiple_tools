import { apiRequest } from '../../shared/api/client'
import type { ApiTool, ConversionTool } from './types'

const formatNames: Record<string, string> = { word: 'DOCX', excel: 'XLSX', powerpoint: 'PPTX', text: 'TXT', markdown: 'MD' }
const displayNames: Record<string, string> = {
  pdf: 'PDF', jpg: 'JPG', png: 'PNG', bmp: 'BMP', tiff: 'TIFF', webp: 'WebP', avif: 'AVIF', heic: 'HEIC',
  html: 'HTML', csv: 'CSV', word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint', text: 'Text', markdown: 'Markdown', image: 'Image', to: 'to',
}

function formatLabel(value: string) {
  return formatNames[value] || value.toUpperCase()
}

function friendlyName(name: string) {
  return name.split('-').map((part) => displayNames[part] || `${part[0].toUpperCase()}${part.slice(1)}`).join(' ')
}

function toolCategory(name: string): ConversionTool['category'] {
  if (name === 'image-to-text') return 'OCR'
  if (name.includes('pdf')) return 'PDF'
  if (name.includes('excel') || name.includes('csv')) return 'Spreadsheets'
  if (/^(avif|bmp|heic|jpg|png|tiff|webp)-to-/.test(name)) return 'Images'
  return 'Documents'
}

function toConversionTool(tool: ApiTool): ConversionTool {
  const parts = tool.name.split('-to-')
  const actionMatch = tool.name.match(/^(compress|rotate|protect|unlock)-(.+)$/)
  const from = actionMatch ? formatLabel(actionMatch[2]) : tool.name === 'image-to-text' ? 'IMG' : formatLabel(parts[0])
  const to = actionMatch ? formatLabel(actionMatch[2]) : tool.name === 'image-to-text' ? 'TXT' : formatLabel(parts[1] || tool.output_suffix.slice(1))

  return {
    id: tool.name,
    name: friendlyName(tool.name),
    from,
    to,
    description: tool.description,
    category: toolCategory(tool.name),
    inputSuffixes: tool.input_suffixes,
    inputMediaTypes: tool.input_media_types,
    outputSuffix: tool.output_suffix,
    outputMediaType: tool.output_media_type,
  }
}

export async function listConversionTools() {
  const tools = await apiRequest<ApiTool[]>('/v1/tools')
  return tools.map(toConversionTool)
}
