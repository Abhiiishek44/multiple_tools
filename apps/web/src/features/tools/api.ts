import generatedCatalog from '../../generated/tool-catalog.json'
import type { ApiTool, ConversionTool } from './types'

function toConversionTool(tool: ApiTool): ConversionTool {
  return {
    id: tool.name,
    slug: tool.slug,
    version: tool.version,
    name: tool.display_name,
    title: tool.title,
    from: tool.input_formats.join(', '),
    to: tool.output_formats.join(', '),
    description: tool.description,
    category: tool.category,
    categorySlug: tool.category_slug,
    categoryDescription: tool.category_description,
    inputSuffixes: tool.input_suffixes,
    inputMediaTypes: tool.input_media_types,
    inputFormats: tool.input_formats,
    outputSuffix: tool.output_suffix,
    outputMediaType: tool.output_media_type,
    outputFormats: tool.output_formats,
    features: tool.features,
    options: tool.options,
    keywords: tool.keywords,
    faq: tool.faq,
    howItWorks: tool.how_it_works,
    relatedTools: tool.related_tools,
  }
}

export const TOOL_CATALOG = (generatedCatalog as ApiTool[]).map(toConversionTool)

export async function listConversionTools(): Promise<ConversionTool[]> {
  return TOOL_CATALOG
}
