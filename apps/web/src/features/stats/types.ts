export type ToolConversionStats = {
  total: number
  successful: number
}

export type PublicStats = {
  total_conversions: number
  today_conversions: number
  successful_conversions: number
  per_tool: Record<string, ToolConversionStats>
}
