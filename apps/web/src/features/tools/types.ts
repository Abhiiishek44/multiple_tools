export const TOOL_CATEGORIES = ['All tools', 'PDF', 'Documents', 'Spreadsheets', 'Images', 'OCR'] as const
export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export type ConversionTool = {
  id: string
  name: string
  from: string
  to: string
  description: string
  category: Exclude<ToolCategory, 'All tools'>
  inputSuffixes: string[]
  inputMediaTypes: string[]
  outputSuffix: string
  outputMediaType: string
}

export type ApiTool = {
  name: string
  version: string
  description: string
  input_suffixes: string[]
  input_media_types: string[]
  output_suffix: string
  output_media_type: string
}
