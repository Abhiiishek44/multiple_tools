export type ToolCategory = string

export type ToolOptionChoice = { value: string | number; label: string }
export type ToolOption = {
  name: string
  label: string
  type: 'text' | 'password' | 'select'
  required: boolean
  description: string
  default: string | number | null
  choices: ToolOptionChoice[]
}

export type ToolFaq = { question: string; answer: string }

export type ConversionTool = {
  id: string
  slug: string
  version: string
  name: string
  title: string
  from: string
  to: string
  description: string
  category: ToolCategory
  categorySlug: string
  categoryDescription: string
  inputSuffixes: string[]
  inputMediaTypes: string[]
  inputFormats: string[]
  outputSuffix: string
  outputMediaType: string
  outputFormats: string[]
  features: string[]
  options: ToolOption[]
  keywords: string[]
  faq: ToolFaq[]
  howItWorks: string[]
  relatedTools: string[]
}

export type ApiTool = {
  name: string
  slug: string
  version: string
  display_name: string
  title: string
  description: string
  category: string
  category_slug: string
  category_description: string
  input_suffixes: string[]
  input_media_types: string[]
  input_formats: string[]
  output_suffix: string
  output_media_type: string
  output_formats: string[]
  features: string[]
  options: ToolOption[]
  keywords: string[]
  faq: ToolFaq[]
  how_it_works: string[]
  related_tools: string[]
}
