import { TOOL_METHODS } from '../generated-tools.js'
import type { Job } from '../models.js'
import type { CreateJobParams, FileInput } from './jobs.js'
import { JobsResource } from './jobs.js'

type ToolMethodName = (typeof TOOL_METHODS)[number]

export type ConversionOptions = Omit<CreateJobParams, 'tool' | 'file'>
export type ConversionMethod = (file: FileInput, options?: ConversionOptions) => Promise<Job>
export type ConversionsResource = Readonly<Record<ToolMethodName, ConversionMethod>>

export function createConversionsResource(jobs: JobsResource): ConversionsResource {
  const methods = TOOL_METHODS.map((method) => [
    method,
    (file: FileInput, options: ConversionOptions = {}) => jobs.create({
      tool: method.replaceAll('_', '-'),
      file,
      ...options,
    }),
  ])
  return Object.freeze(Object.fromEntries(methods)) as ConversionsResource
}
