import type { ConversionTool, ToolCategory } from './types'

export const ALL_TOOLS = 'All tools'

export const SITE_FAQS = [
  { question: 'Which file formats are supported?', answer: 'Available formats depend on the converter you choose. Each tool page lists its accepted extensions and output format before you upload.' },
  { question: 'How large can my file be?', answer: 'Uploads can be up to 50 MB. The limit is checked in your browser before a conversion starts.' },
  { question: 'Are my files private?', answer: 'Files are sent only to the Multiple Tools conversion API and are removed automatically after the configured retention period.' },
  { question: 'Can I use Multiple Tools on my phone?', answer: 'Yes. The catalog, upload flow, progress states, and downloads are designed for touch screens and small displays.' },
  { question: 'Why do I need to sign in?', answer: 'Google sign-in secures conversion jobs and prevents other visitors from accessing your job status or output.' },
]

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

export function getRelatedTools(tool: ConversionTool, tools: ConversionTool[]) {
  const bySlug = new Map(tools.map((candidate) => [candidate.slug, candidate]))
  return tool.relatedTools.map((slug) => bySlug.get(slug)).filter((candidate): candidate is ConversionTool => Boolean(candidate))
}

export function matchesToolQuery(tool: ConversionTool, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const searchable = `${tool.name} ${tool.description} ${tool.category} ${tool.from} ${tool.to} ${tool.keywords.join(' ')}`.toLowerCase()
  return terms.every((term) => searchable.includes(term))
}
