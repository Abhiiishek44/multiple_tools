import { useCallback, useEffect, useState } from 'react'
import { ConvertingPage } from '../Domains/Tools/Pages/ConvertingPage'
import { ResultPage } from '../Domains/Tools/Pages/ResultPage'
import { UploadPage } from '../Domains/Tools/Pages/UploadPage'
import {
  createConversionJob,
  downloadConversionOutput,
  getConversionJob,
  getCurrentUser,
  listConversionTools,
  logout,
  type AuthenticatedUser,
  type ConversionJob,
  type ConversionTool,
  type ToolOptions,
} from '../Domains/Tools/api/conversion'
import { AuthControl } from '../Domains/Tools/components/AuthControl'
import { FlowSteps, type ToolView } from '../Domains/Tools/components/FlowSteps'
import { ToolCatalog } from '../Domains/Tools/components/ToolCatalog'
import { LockIcon } from '../Shared/Components/Icons'

export function AppRouter() {
  const [view, setView] = useState<ToolView>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [selectedTool, setSelectedTool] = useState<ConversionTool | null>(null)
  const [tools, setTools] = useState<ConversionTool[]>([])
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [job, setJob] = useState<ConversionJob | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  const loadTools = useCallback(async () => {
    try {
      setTools(await listConversionTools())
    } catch (error) {
      setCatalogError(error instanceof Error ? `Could not reach the tools API: ${error.message}` : 'Could not reach the tools API.')
    } finally {
      setIsLoadingTools(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void listConversionTools()
      .then((available) => { if (active) setTools(available) })
      .catch((error: unknown) => { if (active) setCatalogError(error instanceof Error ? `Could not reach the tools API: ${error.message}` : 'Could not reach the tools API.') })
      .finally(() => { if (active) setIsLoadingTools(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { void getCurrentUser().then(setUser).catch(() => setUser(null)) }, [])

  const jobId = job?.id
  useEffect(() => {
    if (view !== 'converting' || !jobId) return
    let stopped = false
    let timer: number | undefined

    const poll = async () => {
      try {
        const updated = await getConversionJob(jobId)
        if (stopped) return
        setJob(updated)
        if (updated.status === 'SUCCESS') {
          setView('result')
          return
        }
        if (updated.status === 'FAILED') {
          setWorkflowError(updated.error || 'The conversion failed. Please try another file.')
          setView('upload')
          return
        }
        timer = window.setTimeout(poll, 900)
      } catch (error) {
        if (stopped) return
        setWorkflowError(error instanceof Error ? error.message : 'Could not check conversion progress.')
        setView('upload')
      }
    }

    timer = window.setTimeout(poll, 500)
    return () => { stopped = true; if (timer) window.clearTimeout(timer) }
  }, [jobId, view])

  const restart = () => {
    setFile(null)
    setJob(null)
    setWorkflowError(null)
    setView('upload')
  }

  const showCatalog = () => {
    restart()
    setSelectedTool(null)
  }

  const selectFile = (nextFile: File) => {
    if (!selectedTool) return
    const dot = nextFile.name.lastIndexOf('.')
    const suffix = dot >= 0 ? nextFile.name.slice(dot).toLowerCase() : ''
    if (!selectedTool.inputSuffixes.includes(suffix)) {
      setFile(null)
      setWorkflowError(`This tool accepts ${selectedTool.inputSuffixes.join(', ').toUpperCase()} files.`)
      return
    }
    if (nextFile.size > 50 * 1024 * 1024) {
      setFile(null)
      setWorkflowError('The selected file is larger than the 50 MB upload limit.')
      return
    }
    setWorkflowError(null)
    setFile(nextFile)
  }

  const convert = async (options: ToolOptions) => {
    if (!file || !selectedTool) return
    setIsSubmitting(true)
    setWorkflowError(null)
    try {
      const created = await createConversionJob(selectedTool.id, file, options)
      setJob(created)
      setView('converting')
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : 'Could not start the conversion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const download = async () => {
    if (!job) return
    setWorkflowError(null)
    try {
      await downloadConversionOutput(job)
    } catch (error) {
      setWorkflowError(error instanceof Error ? error.message : 'Could not download the converted file.')
    }
  }

  const signOut = async () => {
    try { await logout() } finally { setUser(null) }
  }

  return (
    <div className={`conversion-app${selectedTool ? ' conversion-app--workspace' : ' conversion-app--catalog'}`}>
      <header className="app-header">
        <button className="brand" type="button" aria-label="Convertly home" onClick={showCatalog}>
          <span className="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg></span>
          <span>Convertly</span>
        </button>
        <div className="header-actions">
          {selectedTool && (
            <button className="selected-tool-chip" type="button" onClick={showCatalog} title="Back to all tools">
              <span className="selected-tool-chip__format">{selectedTool.from}</span>
              <span><small>Selected service</small><strong>{selectedTool.name}</strong></span>
              <i aria-hidden="true">×</i>
            </button>
          )}
          <AuthControl user={user} onLogout={() => void signOut()} />
          <div className="security-badge"><LockIcon /><span>Private &amp; secure</span></div>
        </div>
      </header>

      {!selectedTool ? (
        <ToolCatalog tools={tools} isLoading={isLoadingTools} error={catalogError} onRetry={() => { setCatalogError(null); setIsLoadingTools(true); void loadTools() }} onSelect={(tool) => { restart(); setSelectedTool(tool); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      ) : (
        <div className="app-content">
          <FlowSteps view={view} />
          <div className="page-transition" key={view}>
            {view === 'upload' && <UploadPage file={file} onFileSelect={selectFile} onRemove={() => { setFile(null); setWorkflowError(null) }} onConvert={(options) => void convert(options)} tool={selectedTool} error={workflowError} isSubmitting={isSubmitting} />}
            {view === 'converting' && file && job && <ConvertingPage file={file} job={job} />}
            {view === 'result' && file && job && <ResultPage file={file} tool={selectedTool} job={job} error={workflowError} onDownload={() => void download()} onRestart={restart} />}
          </div>
        </div>
      )}
    </div>
  )
}
