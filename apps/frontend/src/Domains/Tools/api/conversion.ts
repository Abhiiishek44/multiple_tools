export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type ConversionTool = {
  id: string
  name: string
  from: string
  to: string
  description: string
  tone: string
  inputSuffixes: string[]
  inputMediaTypes: string[]
  outputSuffix: string
  outputMediaType: string
}

export type ToolOptions = Record<string, string | number>

export type ConversionJob = {
  id: string
  tool_name: string
  tool_version: string
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  progress: number
  input_filename: string
  output_filename: string | null
  output_url: string | null
  error: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export type AuthenticatedUser = { id: string; email: string; name: string; picture_url: string | null }

type ApiTool = {
  name: string
  version: string
  description: string
  input_suffixes: string[]
  input_media_types: string[]
  output_suffix: string
  output_media_type: string
}

const formatNames: Record<string, string> = { word: 'DOCX', excel: 'XLSX', powerpoint: 'PPTX', text: 'TXT', markdown: 'MD' }
const displayNames: Record<string, string> = {
  pdf: 'PDF', jpg: 'JPG', png: 'PNG', bmp: 'BMP', tiff: 'TIFF', webp: 'WebP', avif: 'AVIF', heic: 'HEIC',
  html: 'HTML', csv: 'CSV', word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint', text: 'Text', markdown: 'Markdown', image: 'Image', to: 'to',
}
const tones = ['blue', 'violet', 'emerald', 'amber', 'purple', 'indigo', 'pink', 'sky', 'mint', 'orange', 'cyan', 'lilac', 'rose', 'lime']

function formatLabel(value: string) {
  return formatNames[value] || value.toUpperCase()
}

function friendlyName(name: string) {
  return name.split('-').map((part) => displayNames[part] || `${part[0].toUpperCase()}${part.slice(1)}`).join(' ')
}

function toConversionTool(tool: ApiTool, index: number): ConversionTool {
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
    tone: tones[index % tones.length],
    inputSuffixes: tool.input_suffixes,
    inputMediaTypes: tool.input_media_types,
    outputSuffix: tool.output_suffix,
    outputMediaType: tool.output_media_type,
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...init })
  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json() as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // The server did not return a JSON error body.
    }
    if (response.status === 401) detail = 'Please sign in with Google before starting a conversion.'
    throw new Error(detail)
  }
  return response.json() as Promise<T>
}

export async function listConversionTools() {
  const tools = await apiRequest<ApiTool[]>('/v1/tools')
  return tools.map(toConversionTool)
}

export function getCurrentUser() {
  return apiRequest<AuthenticatedUser>('/v1/auth/me')
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
  if (!response.ok && response.status !== 204) throw new Error('Could not sign out.')
}

export function createConversionJob(toolName: string, file: File, options: ToolOptions = {}) {
  const form = new FormData()
  form.append('file', file)
  if (Object.keys(options).length) form.append('options', JSON.stringify(options))

  return apiRequest<ConversionJob>(`/v1/tools/${encodeURIComponent(toolName)}/jobs`, {
    method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: form,
  })
}

export function getConversionJob(jobId: string) {
  return apiRequest<ConversionJob>(`/v1/jobs/${encodeURIComponent(jobId)}`)
}

export async function downloadConversionOutput(job: ConversionJob) {
  const response = await fetch(`${API_BASE_URL}/v1/jobs/${encodeURIComponent(job.id)}/output`, { credentials: 'include' })
  if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in again to download this file.' : 'The converted file is not available yet.')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = job.output_filename || `converted-${job.id}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

