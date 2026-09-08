export type ConversionTool = {
  id: string
  name: string
  from: string
  to: string
  description: string
  tone: string
}

const conversionTools: ConversionTool[] = [
  { id: 'pdf-to-word', name: 'PDF to Word', from: 'PDF', to: 'DOCX', description: 'Turn PDFs into editable Word documents.', tone: 'blue' },
  { id: 'word-to-pdf', name: 'Word to PDF', from: 'DOCX', to: 'PDF', description: 'Create polished PDFs from Word files.', tone: 'violet' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', from: 'JPG', to: 'PDF', description: 'Combine JPG images into a clean PDF.', tone: 'emerald' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', from: 'PDF', to: 'JPG', description: 'Export PDF pages as crisp JPG images.', tone: 'amber' },
  { id: 'compress-pdf', name: 'Compress PDF', from: 'PDF', to: 'PDF', description: 'Reduce file size while keeping quality.', tone: 'purple' },
  { id: 'pdf-to-excel', name: 'PDF to Excel', from: 'PDF', to: 'XLSX', description: 'Move PDF tables into editable sheets.', tone: 'indigo' },
  { id: 'excel-to-pdf', name: 'Excel to PDF', from: 'XLSX', to: 'PDF', description: 'Share spreadsheets as reliable PDFs.', tone: 'pink' },
  { id: 'pdf-to-powerpoint', name: 'PDF to PowerPoint', from: 'PDF', to: 'PPTX', description: 'Turn PDF pages into editable slides.', tone: 'sky' },
  { id: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', from: 'PPTX', to: 'PDF', description: 'Export presentations into a PDF.', tone: 'mint' },
  { id: 'png-to-pdf', name: 'PNG to PDF', from: 'PNG', to: 'PDF', description: 'Convert PNG images into a PDF file.', tone: 'orange' },
  { id: 'pdf-to-png', name: 'PDF to PNG', from: 'PDF', to: 'PNG', description: 'Save every PDF page as a PNG.', tone: 'cyan' },
  { id: 'jpg-to-png', name: 'JPG to PNG', from: 'JPG', to: 'PNG', description: 'Convert JPG images to PNG format.', tone: 'lilac' },
  { id: 'png-to-jpg', name: 'PNG to JPG', from: 'PNG', to: 'JPG', description: 'Create compact JPGs from PNG images.', tone: 'rose' },
  { id: 'heic-to-jpg', name: 'HEIC to JPG', from: 'HEIC', to: 'JPG', description: 'Make HEIC photos easy to view and share.', tone: 'lime' },
  { id: 'image-to-text', name: 'Image to Text', from: 'IMG', to: 'TXT', description: 'Extract text from an image with OCR.', tone: 'blue' },
]

type ToolCatalogProps = { onSelect: (tool: ConversionTool) => void }

function FormatMark({ format }: { format: string }) {
  if (['JPG', 'PNG', 'HEIC', 'IMG'].includes(format)) {
    return (
      <svg className="format-mark format-mark--image" viewBox="0 0 24 20">
        <circle cx="17.5" cy="5" r="2" />
        <path d="m3 17 5.5-6 3.5 3.5 2.5-2.5 6.5 5" />
      </svg>
    )
  }

  if (format === 'TXT') {
    return (
      <svg className="format-mark format-mark--text" viewBox="0 0 24 20">
        <path d="M4 4h16M4 8h16M4 12h12M4 16h9" />
      </svg>
    )
  }

  if (format === 'PDF') {
    return (
      <svg className="format-mark format-mark--pdf" viewBox="0 0 24 20">
        <path d="M6 16c4-5 6-10 6-13 0 7 2 11 6 14-5-3-10-2-14 0 4-1 10-2 16-2" />
      </svg>
    )
  }

  const letter = format === 'DOCX' ? 'W' : format === 'XLSX' ? 'X' : format === 'PPTX' ? 'P' : format.slice(0, 1)
  return <span className="format-mark format-mark--letter">{letter}</span>
}

function FileBadge({ format, output }: { format: string; output?: boolean }) {
  return (
    <span className={`format-badge format-badge--${format.toLowerCase()}${output ? ' format-badge--output' : ''}`}>
      <svg viewBox="0 0 48 58" aria-hidden="true">
        <path className="format-badge__paper" d="M8 2.5h21l11 11V54a1.5 1.5 0 0 1-1.5 1.5h-29A1.5 1.5 0 0 1 8 54z" />
        <path className="format-badge__fold" d="M29 2.5v9.75c0 .7.55 1.25 1.25 1.25H40" />
        <path className="format-badge__detail" d="M15 21h18M15 25.5h13" />
      </svg>
      <FormatMark format={format} />
      <strong title={format}>{format}</strong>
    </span>
  )
}

function TextScanBadge() {
  return (
    <span className="text-scan-badge">
      <i className="text-scan-badge__corner text-scan-badge__corner--tl" />
      <i className="text-scan-badge__corner text-scan-badge__corner--tr" />
      <strong>T</strong>
      <i className="text-scan-badge__corner text-scan-badge__corner--bl" />
      <i className="text-scan-badge__corner text-scan-badge__corner--br" />
    </span>
  )
}

function ConversionArrow({ reverse }: { reverse?: boolean }) {
  return <span className={`tool-card__arrow${reverse ? ' tool-card__arrow--reverse' : ''}`}><svg viewBox="0 0 24 24"><path d="M5 12h13m-4-4 4 4-4 4" /></svg></span>
}

function ToolVisual({ tool }: { tool: ConversionTool }) {
  if (tool.id === 'compress-pdf') {
    return <span className="tool-card__visual tool-card__visual--compress"><ConversionArrow /><FileBadge format="PDF" /><ConversionArrow reverse /></span>
  }

  if (tool.id === 'image-to-text') {
    return <span className="tool-card__visual"><FileBadge format="IMG" /><ConversionArrow /><TextScanBadge /></span>
  }

  return <span className="tool-card__visual"><FileBadge format={tool.from} /><ConversionArrow /><FileBadge format={tool.to} output /></span>
}

export function ToolCatalog({ onSelect }: ToolCatalogProps) {
  return (
    <main className="catalog-page">
      <section className="catalog-hero" aria-labelledby="catalog-title">
        <div className="hero-orb hero-orb--one" aria-hidden="true" />
        <div className="hero-orb hero-orb--two" aria-hidden="true" />
        <span className="catalog-kicker"><span /> 15 tools. One simple workflow.</span>
        <h1 id="catalog-title">Every file, in the<br /><em>format you need.</em></h1>
        <p>Fast, private file conversion that works right in your browser. Choose a tool below to get started.</p>
        <a className="hero-cta" href="#conversion-tools">Explore all tools <span aria-hidden="true">↓</span></a>
        <div className="hero-trust" aria-label="Product benefits">
          <span><i>✓</i> No sign-up</span><span><i>✓</i> Secure processing</span><span><i>✓</i> Quick results</span>
        </div>
      </section>

      <section className="tools-section" id="conversion-tools" aria-labelledby="tools-title">
        <div className="section-heading">
          <div><span className="section-index">01 / TOOLS</span><h2 id="tools-title">Choose your converter</h2></div>
          <p>Click any service to begin. Your selected tool will stay visible while you work.</p>
        </div>
        <div className="tool-grid">
          {conversionTools.map((tool, index) => (
            <button className={`tool-card tool-card--${tool.tone}`} type="button" key={tool.id} onClick={() => onSelect(tool)} aria-label={`Open ${tool.name}`}>
              <span className="tool-card__number">{String(index + 1).padStart(2, '0')}</span>
              <span className="tool-card__visual-wrap" aria-hidden="true"><ToolVisual tool={tool} /></span>
              <span className="tool-card__copy"><strong>{tool.name}</strong><small>{tool.description}</small></span>
              <span className="tool-card__go" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <div className="section-heading section-heading--light"><div><span className="section-index">02 / HOW IT WORKS</span><h2 id="how-title">Done in three small steps</h2></div></div>
        <div className="process-grid">
          <div><span>01</span><strong>Choose a tool</strong><p>Pick the conversion that matches your file.</p></div>
          <div><span>02</span><strong>Upload your file</strong><p>Drop it in securely from any device.</p></div>
          <div><span>03</span><strong>Download the result</strong><p>Your converted file is ready in moments.</p></div>
        </div>
      </section>
    </main>
  )
}
