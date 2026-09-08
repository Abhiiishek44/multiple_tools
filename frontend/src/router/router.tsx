import { useEffect, useState } from 'react'
import { ConvertingPage } from '../Domains/Tools/Pages/ConvertingPage'
import { ResultPage } from '../Domains/Tools/Pages/ResultPage'
import { UploadPage } from '../Domains/Tools/Pages/UploadPage'
import { CONVERSION_DURATION_MS, downloadConvertedFile } from '../Domains/Tools/api/conversion'
import { FlowSteps, type ToolView } from '../Domains/Tools/components/FlowSteps'
import { ToolCatalog, type ConversionTool } from '../Domains/Tools/components/ToolCatalog'
import { LockIcon } from '../Shared/Components/Icons'
import { getConvertedFileName } from '../Shared/Utils/file'

export function AppRouter() {
  const [view, setView] = useState<ToolView>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [selectedTool, setSelectedTool] = useState<ConversionTool | null>(null)

  useEffect(() => {
    if (view !== 'converting') return

    const timer = window.setTimeout(() => setView('result'), CONVERSION_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [view])

  const restart = () => {
    setFile(null)
    setView('upload')
  }

  const showCatalog = () => {
    setFile(null)
    setView('upload')
    setSelectedTool(null)
  }

  const download = () => {
    if (!file) return
    downloadConvertedFile(file, getConvertedFileName(file.name, selectedTool?.to))
  }

  return (
    <div className={`conversion-app${selectedTool ? ' conversion-app--workspace' : ' conversion-app--catalog'}`}>
      <header className="app-header">
        <div className="brand" aria-label="Convertly home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg>
          </span>
          <span>Convertly</span>
        </div>
        <div className="header-actions">
          {selectedTool && (
            <button className="selected-tool-chip" type="button" onClick={showCatalog} title="Back to all tools">
              <span className="selected-tool-chip__format">{selectedTool.from}</span>
              <span><small>Selected service</small><strong>{selectedTool.name}</strong></span>
              <i aria-hidden="true">×</i>
            </button>
          )}
          <div className="security-badge"><LockIcon /><span>Private &amp; secure</span></div>
        </div>
      </header>

      {!selectedTool ? (
        <ToolCatalog onSelect={(tool) => { setSelectedTool(tool); setView('upload'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      ) : (
        <div className="app-content">
          <FlowSteps view={view} />
          <div className="page-transition" key={view}>
          {view === 'upload' && (
            <UploadPage
              file={file}
              onFileSelect={setFile}
              onRemove={() => setFile(null)}
              onConvert={() => file && setView('converting')}
              tool={selectedTool}
            />
          )}
          {view === 'converting' && file && <ConvertingPage file={file} />}
          {view === 'result' && file && <ResultPage file={file} tool={selectedTool} onDownload={download} onRestart={restart} />}
          </div>
        </div>
      )}

    </div>
  )
}
