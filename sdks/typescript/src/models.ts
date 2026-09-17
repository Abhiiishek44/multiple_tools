export interface Health {
  status: string
}

export interface Tool {
  name: string
  description: string
  inputSuffixes: readonly string[]
  inputMediaTypes: readonly string[]
  outputSuffix: string
  outputMediaType: string
}

export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED'

export interface Job {
  id: string
  toolName: string
  status: JobStatus
  progress: number
  inputFilename: string
  outputFilename: string | null
  outputURL: string | null
  error: string | null
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  isTerminal: boolean
}
