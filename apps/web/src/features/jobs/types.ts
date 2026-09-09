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
