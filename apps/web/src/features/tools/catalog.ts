import type { ConversionTool, ToolCategory } from './types'

export const ALL_TOOLS = 'All tools'

export function getToolCategories(tools: ConversionTool[]): ToolCategory[] {
  return [ALL_TOOLS, ...new Set(tools.map((tool) => tool.category))]
}

export function getCategorySlug(category: ToolCategory, tools: ConversionTool[]) {
  if (category === ALL_TOOLS) return 'all-tools'
  return tools.find((tool) => tool.category === category)?.categorySlug || category.toLowerCase().replaceAll(' ', '-')
}

export function getCategoryDescription(category: ToolCategory, tools: ConversionTool[]) {
  if (category === ALL_TOOLS) return 'Every converter in one place'
  return tools.find((tool) => tool.category === category)?.categoryDescription || `Browse ${category} tools`
}

export function getToolCardSummary(tool: ConversionTool) {
  return tool.description
}

export function getToolAbout(tool: ConversionTool) {
  return `${tool.description} Upload a supported file, choose any available settings, and follow live progress until the output is ready.`
}

export function matchesToolQuery(tool: ConversionTool, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const searchable = `${tool.name} ${tool.description} ${tool.category} ${tool.from} ${tool.to} ${tool.keywords.join(' ')}`.toLowerCase()
  return terms.every((term) => searchable.includes(term))
}
