import { API_BASE_URL, apiRequest, responseError } from '../../shared/api/client'
import { ApiError } from '../../shared/api/errors'
import type { ConversionTool } from '../tools/types'
import type { ConversionJob, ToolOptions } from './types'

export function createConversionJob(tool: ConversionTool, file: File, options: ToolOptions = {}, idempotencyKey = crypto.randomUUID()) {
  const form = new FormData()
  form.append('file', fileWithAcceptedMediaType(file, tool))
  if (Object.keys(options).length) form.append('options', JSON.stringify(options))
  return apiRequest<ConversionJob>(`/v1/tools/${encodeURIComponent(tool.id)}/jobs`, {
    method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: form,
  })
}

function fileWithAcceptedMediaType(file: File, tool: ConversionTool) {
  const mediaType = file.type.split(';', 1)[0].trim().toLowerCase()
  if (tool.inputMediaTypes.includes(mediaType)) return file
  return new File([file], file.name, { type: tool.inputMediaTypes[0] || 'application/octet-stream', lastModified: file.lastModified })
}

export function getConversionJob(jobId: string) {
  return apiRequest<ConversionJob>(`/v1/jobs/${encodeURIComponent(jobId)}`)
}

export async function downloadConversionOutput(job: ConversionJob) {
  if (!job.output_url) throw new Error('The converted file is not available yet.')
  const response = await fetch(`${API_BASE_URL}${job.output_url}`, { credentials: 'include' })
  if (!response.ok) throw new ApiError(await responseError(response), response.status)

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
