import { ResponseValidationError } from '../errors.js'
import type { Health, Job, JobStatus, Tool } from '../models.js'

type ObjectValue = Record<string, unknown>

function object(value: unknown, label: string): ObjectValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ResponseValidationError(`Expected the ${label} API to return an object`)
  }
  return value as ObjectValue
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new ResponseValidationError(`Invalid response field: ${field}`)
  return value
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null
  return string(value, field)
}

function stringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new ResponseValidationError(`Invalid response field: ${field}`)
  }
  return Object.freeze([...value])
}

function date(value: unknown, field: string): Date {
  const parsed = new Date(string(value, field))
  if (Number.isNaN(parsed.valueOf())) throw new ResponseValidationError(`Invalid response field: ${field}`)
  return parsed
}

function nullableDate(value: unknown, field: string): Date | null {
  return value === null ? null : date(value, field)
}

export function parseHealth(value: unknown): Health {
  const data = object(value, 'health')
  return Object.freeze({ status: string(data.status, 'status') })
}

export function parseTools(value: unknown): readonly Tool[] {
  if (!Array.isArray(value)) throw new ResponseValidationError('Expected the tools API to return a list')
  return Object.freeze(value.map((entry) => {
    const data = object(entry, 'tool')
    return Object.freeze({
      name: string(data.name, 'name'),
      version: string(data.version, 'version'),
      description: string(data.description, 'description'),
      inputSuffixes: stringArray(data.input_suffixes, 'input_suffixes'),
      inputMediaTypes: stringArray(data.input_media_types, 'input_media_types'),
      outputSuffix: string(data.output_suffix, 'output_suffix'),
      outputMediaType: string(data.output_media_type, 'output_media_type'),
    })
  }))
}

const JOB_STATUSES = new Set<JobStatus>(['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED'])

export function parseJob(value: unknown): Job {
  const data = object(value, 'job')
  const status = string(data.status, 'status') as JobStatus
  if (!JOB_STATUSES.has(status)) throw new ResponseValidationError(`Unknown job status: ${status}`)
  if (typeof data.progress !== 'number' || !Number.isInteger(data.progress) || data.progress < 0 || data.progress > 100) {
    throw new ResponseValidationError('Invalid response field: progress')
  }

  return Object.freeze({
    id: string(data.id, 'id'),
    toolName: string(data.tool_name, 'tool_name'),
    toolVersion: string(data.tool_version, 'tool_version'),
    status,
    progress: data.progress,
    inputFilename: string(data.input_filename, 'input_filename'),
    outputFilename: nullableString(data.output_filename, 'output_filename'),
    outputURL: nullableString(data.output_url, 'output_url'),
    error: nullableString(data.error, 'error'),
    createdAt: date(data.created_at, 'created_at'),
    startedAt: nullableDate(data.started_at, 'started_at'),
    completedAt: nullableDate(data.completed_at, 'completed_at'),
    isTerminal: status === 'SUCCESS' || status === 'FAILED',
  })
}

