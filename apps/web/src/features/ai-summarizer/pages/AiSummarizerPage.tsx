import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { ApiError } from '../../../shared/api/errors'
import { CheckIcon, FileIcon, UploadIcon } from '../../../shared/components/icons/Icons'
import {
  createSummaryConversation,
  streamSummary,
  uploadSummaryDocument,
  waitForSummaryDocument,
} from '../api'
import type { ChatDocument, Citation } from '../types'

type Phase = 'idle' | 'uploading' | 'processing' | 'summarizing' | 'complete'

const ACCEPTED_SUFFIXES = ['.txt', '.md', '.docx', '.pdf']

export function AiSummarizerPage({ onLogin }: { onLogin: () => void }) {
  const { status: authStatus, invalidateSession } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [document, setDocument] = useState<ChatDocument | null>(null)
  const [summary, setSummary] = useState('')
  const [citations, setCitations] = useState<Citation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [length, setLength] = useState('concise')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const chooseFile = (nextFile: File) => {
    const suffix = nextFile.name.slice(nextFile.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED_SUFFIXES.includes(suffix)) {
      setError('Choose a TXT, Markdown, DOCX, or PDF document.')
      return
    }
    if (nextFile.size > 50 * 1024 * 1024) {
      setError('The selected document is larger than the 50 MB limit.')
      return
    }
    setFile(nextFile)
    setDocument(null)
    setSummary('')
    setCitations([])
    setError(null)
    setPhase('idle')
  }

  const summarize = async () => {
    if (!file) return
    if (authStatus !== 'authenticated') {
      onLogin()
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setError(null)
    setSummary('')
    setCitations([])
    setPhase('uploading')
    try {
      const conversation = await createSummaryConversation(file.name)
      const uploaded = await uploadSummaryDocument(conversation.id, file)
      setDocument(uploaded)
      setPhase('processing')
      await waitForSummaryDocument(conversation.id, uploaded.id, setDocument, controller.signal)
      setPhase('summarizing')
      const prompt = `Create a ${length} summary of this document. Cover the main ideas, important facts, decisions, and action items. Use clear headings and bullet points where useful.`
      await streamSummary(conversation.id, prompt, {
        onCitations: setCitations,
        onToken: (token) => setSummary((current) => current + token),
      }, controller.signal)
      setPhase('complete')
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      if (requestError instanceof ApiError && requestError.status === 401) invalidateSession()
      setError(requestError instanceof Error ? requestError.message : 'Could not summarize this document.')
      setPhase('idle')
    }
  }

  const busy = phase !== 'idle' && phase !== 'complete'
  const statusText = phase === 'uploading'
    ? 'Uploading securely…'
    : phase === 'processing'
      ? document?.status === 'PROCESSING' ? 'Reading and indexing your document…' : 'Waiting for the AI worker…'
      : phase === 'summarizing'
        ? 'Writing your summary…'
        : phase === 'complete'
          ? 'Summary complete'
          : 'Ready to summarize'

  return (
    <main className="mx-auto w-[min(980px,calc(100%_-_40px))] py-10 max-[640px]:w-[calc(100%_-_28px)] max-[640px]:py-6" aria-labelledby="summarizer-title">
      <header className="mb-8 max-w-[680px]">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[var(--accent-strong)]">AI workspace</p>
        <h1 className="m-0 text-[clamp(34px,5vw,54px)] leading-[1.02] tracking-[-.055em]" id="summarizer-title">AI Document Summarizer</h1>
        <p className="mb-0 mt-4 text-sm leading-7 text-[var(--muted)]">Upload a document and receive a grounded summary with references to the source text. Scanned PDFs are processed with OCR automatically.</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 max-[800px]:grid-cols-1">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 max-[520px]:p-4" aria-label="Summarizer controls">
          <label className="group grid min-h-56 cursor-pointer place-items-center rounded-xl border border-dashed border-[var(--faint)] bg-[var(--surface)] p-6 text-center transition-colors hover:border-[var(--accent)]" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const dropped = event.dataTransfer.files[0]; if (dropped) chooseFile(dropped) }}>
            <input className="sr-only" type="file" accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={busy} onChange={(event) => { const selected = event.target.files?.[0]; if (selected) chooseFile(selected) }} />
            {file ? <span><span className="mx-auto grid size-14 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-strong)] [&_svg]:size-6"><FileIcon /></span><strong className="mt-4 block break-all text-sm">{file.name}</strong><small className="mt-1 block text-[11px] text-[var(--muted)]">{formatBytes(file.size)} · Click or drop another document to replace</small></span> : <span><span className="mx-auto grid size-14 place-items-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-strong)] [&_svg]:size-6"><UploadIcon /></span><strong className="mt-4 block text-base">Drop your document here</strong><small className="mt-1.5 block text-[11px] leading-5 text-[var(--muted)]">TXT, Markdown, DOCX, or PDF · Maximum 50 MB</small></span>}
          </label>

          <div className="mt-5 flex items-end gap-3 max-[520px]:flex-col max-[520px]:items-stretch">
            <label className="flex-1 text-xs font-semibold text-[var(--muted)]">Summary length<select className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]" value={length} disabled={busy} onChange={(event) => setLength(event.target.value)}><option value="concise">Concise</option><option value="detailed">Detailed</option><option value="comprehensive">Comprehensive</option></select></label>
            <button className="h-11 rounded-lg bg-[var(--accent)] px-6 text-sm font-bold text-[var(--accent-text)] transition-opacity disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={!file || busy} onClick={() => void summarize()}>{busy ? statusText : phase === 'complete' ? 'Summarize again' : 'Summarize document'}</button>
          </div>
          {error && <p className="mb-0 mt-4 rounded-lg border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_6%,var(--surface))] px-4 py-3 text-xs leading-5 text-[var(--danger)]" role="alert">{error}</p>}
        </section>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="m-0 text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--faint)]">Processing</p>
          <div className="mt-5 space-y-4">
            <StatusStep label="Upload document" complete={phase !== 'idle'} active={phase === 'uploading'} />
            <StatusStep label="Extract and index" complete={['summarizing', 'complete'].includes(phase)} active={phase === 'processing'} />
            <StatusStep label="Generate summary" complete={phase === 'complete'} active={phase === 'summarizing'} />
          </div>
          <p className="mb-0 mt-6 text-xs leading-5 text-[var(--muted)]" role="status">{statusText}</p>
        </aside>
      </div>

      {(summary || phase === 'summarizing') && <section className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 max-[520px]:p-5" aria-live="polite"><div className="flex items-center justify-between gap-3"><h2 className="m-0 text-2xl tracking-[-.035em]">Summary</h2>{phase === 'complete' && <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-strong)] [&_svg]:size-4"><CheckIcon /> Complete</span>}</div><div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{summary || 'Starting the summary…'}</div>{citations.length > 0 && <div className="mt-7 border-t border-[var(--border)] pt-5"><h3 className="m-0 text-sm">Source passages</h3><div className="mt-3 grid gap-3">{citations.map((citation, index) => <details className="rounded-lg bg-[var(--surface-soft)] px-4 py-3 text-xs" key={`${citation.document_id}-${citation.chunk_index}`}><summary className="cursor-pointer font-semibold">Source {index + 1} · {citation.filename}</summary><p className="mb-0 mt-2 leading-5 text-[var(--muted)]">{citation.excerpt}</p></details>)}</div></div>}</section>}
    </main>
  )
}

function StatusStep({ label, complete, active }: { label: string; complete: boolean; active: boolean }) {
  return <div className="flex items-center gap-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs [&_svg]:size-3.5 ${complete ? 'bg-[var(--accent)] text-[var(--accent-text)]' : active ? 'bg-[var(--surface-strong)] text-[var(--accent-strong)]' : 'bg-[var(--surface-soft)] text-[var(--faint)]'}`}>{complete ? <CheckIcon /> : active ? <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : '·'}</span><span className={`text-xs ${active || complete ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]'}`}>{label}</span></div>
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
