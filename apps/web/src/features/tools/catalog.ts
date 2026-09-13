import type { ConversionTool, ToolCategory } from './types'

export const CATEGORY_DETAILS: Record<ToolCategory, { description: string; tone: string }> = {
  'All tools': { description: 'Every converter in one place', tone: 'lime' },
  PDF: { description: 'Edit and convert PDFs', tone: 'red' },
  Documents: { description: 'Word, text and web files', tone: 'blue' },
  Spreadsheets: { description: 'Excel and CSV workflows', tone: 'orange' },
  Images: { description: 'Fast image conversions', tone: 'green' },
  OCR: { description: 'Extract text from images', tone: 'purple' },
}

export const SITE_FAQS = [
  { question: 'Which file formats are supported?', answer: 'Available formats depend on the converter you choose. Each tool page lists its accepted extensions and output format before you upload.' },
  { question: 'How large can my file be?', answer: 'Uploads can be up to 50 MB. The limit is checked in your browser before a conversion starts.' },
  { question: 'Are my files private?', answer: 'Files are sent only to the Multiple Tools conversion API and are removed automatically after the configured retention period.' },
  { question: 'Can I use Multiple Tools on my phone?', answer: 'Yes. The catalog, upload flow, progress states, and downloads are designed for touch screens and small displays.' },
  { question: 'Why do I need to sign in?', answer: 'Google sign-in secures conversion jobs and prevents other visitors from accessing your job status or output.' },
]

const TOOL_CARD_SUMMARIES: Record<string, string> = {
  'compress-pdf': 'Reduce PDF file size for faster sharing and storage.',
  'rotate-pdf': 'Rotate every PDF page to the correct orientation.',
  'protect-pdf': 'Add password protection to keep your PDF secure.',
  'unlock-pdf': 'Remove password protection from an unlocked PDF.',
  'image-to-text': 'Extract editable text from photos and scanned images.',
  'pdf-to-text': 'Extract readable text from digital or scanned PDFs.',
  'pdf-to-excel': 'Turn PDF tables into an editable Excel spreadsheet.',
  'pdf-to-word': 'Turn PDF content into an editable Word document.',
  'pdf-to-powerpoint': 'Convert PDF pages into an editable PowerPoint deck.',
  'pdf-to-jpg': 'Save every PDF page as a high-quality JPG image.',
  'pdf-to-png': 'Save every PDF page as a crisp PNG image.',
  'pdf-to-html': 'Turn PDF pages into browser-ready HTML content.',
  'word-to-text': 'Extract clean plain text from a Word document.',
  'excel-to-csv': 'Export the active Excel worksheet as a CSV file.',
}

export function getToolCardSummary(tool: ConversionTool) {
  const customSummary = TOOL_CARD_SUMMARIES[tool.id]
  if (customSummary) return customSummary

  if (tool.category === 'Images') {
    return `Convert ${tool.from} images to ${tool.to} for easier sharing and compatibility.`
  }
  if (tool.to === 'PDF') {
    return `Turn ${tool.from} files into clean, shareable PDF documents.`
  }
  if (tool.to === 'DOCX') {
    return `Convert ${tool.from} content into an editable Word document.`
  }
  if (tool.to === 'XLSX') {
    return `Transform ${tool.from} data into an editable Excel spreadsheet.`
  }
  if (tool.to === 'HTML') {
    return `Convert ${tool.from} content into browser-ready HTML.`
  }
  if (tool.to === 'TXT') {
    return `Extract clean, editable text from your ${tool.from} file.`
  }

  return `Convert ${tool.from} files to ${tool.to} in a few simple steps.`
}

export function getToolFaqs(tool: ConversionTool) {
  return [
    { question: `How do I use ${tool.name}?`, answer: `Choose a ${tool.from} file, review any available settings, start the conversion, and download the resulting ${tool.to} file when processing finishes.` },
    { question: `What files does ${tool.name} accept?`, answer: `This tool accepts ${tool.inputSuffixes.join(', ').toUpperCase()} files up to 50 MB.` },
    { question: 'Will the original file be changed?', answer: 'No. Your original file stays untouched on your device. Multiple Tools creates a separate converted output.' },
    { question: 'What happens if I close this page?', answer: 'Once created, the job has its own URL. If you are signed in, opening that URL restores the latest status from the backend.' },
  ]
}

export function getToolAbout(tool: ConversionTool) {
  return `${tool.name} turns ${tool.from} files into ${tool.to} through the Multiple Tools conversion API. Upload a supported file, choose any tool-specific options, and follow the live progress until your download is ready. The focused workflow keeps every step clear on desktop and mobile.`
}

export function matchesToolQuery(tool: ConversionTool, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const searchable = `${tool.name} ${tool.description} ${tool.category} ${tool.from} ${tool.to}`.toLowerCase()
  return terms.every((term) => searchable.includes(term))
}
