import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthControl } from '../features/auth/components/AuthControl'
import { useAuth } from '../features/auth/context/useAuth'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ApiDocsPage } from '../features/developers/pages/ApiDocsPage'
import { PythonSdkPage } from '../features/developers/pages/PythonSdkPage'
import { TypeScriptSdkPage } from '../features/developers/pages/TypeScriptSdkPage'
import { createConversionJob, downloadConversionOutput, getConversionJob } from '../features/jobs/api'
import type { JobView } from '../features/jobs/components/FlowSteps'
import { useJobPolling } from '../features/jobs/hooks/useJobPolling'
import { CreateJobPage } from '../features/jobs/pages/CreateJobPage'
import { JobProgressPage } from '../features/jobs/pages/JobProgressPage'
import { JobResultPage } from '../features/jobs/pages/JobResultPage'
import type { ConversionJob, ToolOptions } from '../features/jobs/types'
import { TOOL_CATALOG } from '../features/tools/api'
import { ALL_TOOLS, getCategorySlug } from '../features/tools/catalog'
import { HomePage } from '../features/tools/pages/HomePage'
import { ToolPage } from '../features/tools/pages/ToolPage'
import { ToolsPage } from '../features/tools/pages/ToolsPage'
import type { ConversionTool, ToolCategory } from '../features/tools/types'
import { ApiError } from '../shared/api/errors'
import { AppShell } from '../shared/components/layout/AppShell'
import { routeFromLocation, routePath, type AppRoute } from './routes'

export function AppRouter() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromLocation())
  const [file, setFile] = useState<File | null>(null)
  const tools: ConversionTool[] = TOOL_CATALOG
  const isLoadingTools = false
  const [job, setJob] = useState<ConversionJob | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, status: authStatus, invalidateSession } = useAuth()
  const submissionKey = useRef(crypto.randomUUID())

  const navigate = useCallback((next: AppRoute, replace = false) => {
    const path = routePath(next)
    if (replace) window.history.replaceState(null, '', path)
    else window.history.pushState(null, '', path)
    setRoute(next)
    document.querySelector<HTMLElement>('[data-scroll-container]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const canonical = routeFromLocation()
    if (window.location.pathname !== routePath(canonical)) window.history.replaceState(null, '', routePath(canonical))
    const handlePopState = () => { setFile(null); setJob(null); setWorkflowError(null); setRoute(routeFromLocation()); document.querySelector<HTMLElement>('[data-scroll-container]')?.scrollTo({ top: 0 }) }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (route.name !== 'login' || authStatus !== 'authenticated') return
    // Auth restoration is external state; keep the URL and local route synchronized.
    // oxlint-disable-next-line react/set-state-in-effect
    navigate({ name: 'dashboard' }, true)
  }, [authStatus, navigate, route.name])

  useEffect(() => {
    if (route.name !== 'job' || authStatus !== 'authenticated' || job?.id === route.jobId) return
    let active = true
    void getConversionJob(route.jobId).then((restored) => {
      if (!active) return
      setJob(restored)
      setWorkflowError(restored.status === 'FAILED' ? restored.error || 'The conversion failed.' : null)
    }).catch((error: unknown) => {
      if (!active) return
      if (error instanceof ApiError && error.status === 401) invalidateSession()
      setWorkflowError(error instanceof Error ? error.message : 'Could not restore this job.')
    })
    return () => { active = false }
  }, [authStatus, invalidateSession, job?.id, route])

  const jobId = route.name === 'job' ? route.jobId : undefined
  const jobStatus = job && job.id === jobId ? job.status : undefined
  const handleJobUpdate = useCallback((updated: ConversionJob) => setJob(updated), [])
  const handleJobFailure = useCallback((message: string) => setWorkflowError(message), [])
  const handleUnauthorized = useCallback(() => invalidateSession(), [invalidateSession])
  useJobPolling({ jobId, status: jobStatus, onUpdate: handleJobUpdate, onFailure: handleJobFailure, onUnauthorized: handleUnauthorized })

  const selectedName = route.name === 'tool' ? route.toolName : route.name === 'job' ? job?.tool_name : undefined
  const selectedTool = tools.find((tool) => tool.id === selectedName) || null
  const view: JobView = route.name === 'job' && job?.id === route.jobId ? job.status === 'SUCCESS' ? 'result' : job.status === 'FAILED' ? 'create' : 'progress' : 'create'

  const resetWorkflow = () => { setFile(null); setJob(null); setWorkflowError(null); submissionKey.current = crypto.randomUUID() }
  const showHome = () => { resetWorkflow(); navigate({ name: 'dashboard' }) }
  const showCatalog = () => { resetWorkflow(); navigate({ name: 'catalog' }) }
  const showApiDocs = () => { resetWorkflow(); navigate({ name: 'api-docs' }) }
  const showPythonSdk = () => { resetWorkflow(); navigate({ name: 'python-sdk' }) }
  const showTypeScriptSdk = () => { resetWorkflow(); navigate({ name: 'typescript-sdk' }) }
  const showCategory = (category: ToolCategory) => { resetWorkflow(); navigate(category === ALL_TOOLS ? { name: 'catalog' } : { name: 'catalog', category: getCategorySlug(category, tools) }) }
  const selectTool = (tool: ConversionTool) => { resetWorkflow(); navigate({ name: 'tool', toolName: tool.id }) }
  const restart = () => { resetWorkflow(); navigate(selectedTool ? { name: 'tool', toolName: selectedTool.id } : { name: 'dashboard' }) }

  const selectFile = (nextFile: File) => {
    if (!selectedTool) return
    const dot = nextFile.name.lastIndexOf('.')
    const suffix = dot >= 0 ? nextFile.name.slice(dot).toLowerCase() : ''
    if (!selectedTool.inputSuffixes.includes(suffix)) { setFile(null); setWorkflowError(`This tool accepts ${selectedTool.inputSuffixes.join(', ').toUpperCase()} files.`); return }
    if (nextFile.size > 50 * 1024 * 1024) { setFile(null); setWorkflowError('The selected file is larger than the 50 MB upload limit.'); return }
    setWorkflowError(null)
    setFile(nextFile)
    submissionKey.current = crypto.randomUUID()
  }

  const convert = async (options: ToolOptions) => {
    if (!file || !selectedTool) return
    if (authStatus !== 'authenticated' || !user) { setWorkflowError('Please sign in with Google before starting a conversion.'); return }
    setIsSubmitting(true)
    setWorkflowError(null)
    try { const created = await createConversionJob(selectedTool, file, options, submissionKey.current); setJob(created); navigate({ name: 'job', jobId: created.id }) }
    catch (error) { if (error instanceof ApiError && error.status === 401) handleUnauthorized(); setWorkflowError(error instanceof Error ? error.message : 'Could not start the conversion.') }
    finally { setIsSubmitting(false) }
  }

  const download = async () => {
    if (!job) return
    setWorkflowError(null)
    try { await downloadConversionOutput(job) }
    catch (error) { if (error instanceof ApiError && error.status === 401) handleUnauthorized(); setWorkflowError(error instanceof Error ? error.message : 'Could not download the converted file.') }
  }

  const restoringJob = route.name === 'job' && (job?.id !== route.jobId || isLoadingTools)
  const unknownTool = route.name === 'tool' && !isLoadingTools && !selectedTool
  const catalogCategory: ToolCategory = route.name === 'catalog' && route.category ? tools.find((tool) => tool.categorySlug === route.category)?.category || ALL_TOOLS : ALL_TOOLS
  const shellTitle = selectedTool?.name || (route.name === 'catalog' ? catalogCategory : route.name === 'login' ? 'Log in' : route.name === 'api-docs' ? 'API Key' : route.name === 'python-sdk' ? 'Python SDK' : route.name === 'typescript-sdk' ? 'TypeScript SDK' : 'Home')
  const shellActive = selectedTool?.category || (route.name === 'catalog' ? catalogCategory === 'All tools' ? 'tools' : catalogCategory : route.name === 'api-docs' ? 'api' : route.name === 'python-sdk' ? 'python-sdk' : route.name === 'typescript-sdk' ? 'typescript-sdk' : 'home')

  return (
    <AppShell title={shellTitle} active={shellActive} tools={tools} onHome={showHome} onTools={showCatalog} onApiDocs={showApiDocs} onPythonSdk={showPythonSdk} onTypeScriptSdk={showTypeScriptSdk} onCategory={showCategory} onSelect={selectTool} authControl={<AuthControl onLogin={() => navigate({ name: 'login' })} onSignedOut={showHome} />}>
      {route.name === 'login' ? <LoginPage onBack={showHome} /> : route.name === 'api-docs' ? <ApiDocsPage onLogin={() => navigate({ name: 'login' })} /> : route.name === 'python-sdk' ? <PythonSdkPage onHome={showHome} onTools={showCatalog} onApiDocs={showApiDocs} /> : route.name === 'typescript-sdk' ? <TypeScriptSdkPage onHome={showHome} onTools={showCatalog} onApiDocs={showApiDocs} /> : restoringJob ? (
        <main className="grid min-h-[calc(100vh-62px)] place-items-center p-[30px]"><section className="w-[min(430px,100%)] rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-[38px] text-center shadow-[var(--panel-shadow)]"><p className="mb-2 text-[10px] font-[850] uppercase tracking-[.14em] text-[var(--accent-strong)]">Restoring job</p><h1 className="m-0 text-3xl tracking-[-.045em]">{authStatus === 'anonymous' ? 'Sign in to view this job' : 'Loading your conversion'}</h1><p className="text-xs leading-[1.65] text-[var(--muted)]">{workflowError || 'Checking your session and loading the latest status from the backend.'}</p></section></main>
      ) : selectedTool ? (
        <ToolPage tool={selectedTool} tools={tools} view={view} onSelect={selectTool} onHome={showHome} onTools={showCatalog}><div key={`${route.name}-${view}`}>{view === 'create' && <CreateJobPage file={file} tool={selectedTool} error={workflowError} isSubmitting={isSubmitting} onFileSelect={selectFile} onRemove={() => { setFile(null); setWorkflowError(null) }} onConvert={(options) => void convert(options)} />}{view === 'progress' && job && <JobProgressPage file={file} job={job} />}{view === 'result' && job && <JobResultPage file={file} tool={selectedTool} job={job} error={workflowError} onDownload={() => void download()} onRestart={restart} />}</div></ToolPage>
      ) : route.name === 'dashboard' ? <HomePage tools={tools} isLoading={isLoadingTools} onSelect={selectTool} onTools={showCatalog} onCategory={showCategory} onHome={showHome} /> : <ToolsPage tools={tools} isLoading={isLoadingTools} category={catalogCategory} error={unknownTool && route.name === 'tool' ? `Unknown tool: ${route.toolName}` : null} onRetry={() => undefined} onSelect={selectTool} onCategory={showCategory} onHome={showHome} onTools={showCatalog} />}
    </AppShell>
  )
}
