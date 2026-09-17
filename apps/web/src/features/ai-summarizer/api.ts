import { API_BASE_URL, apiRequest, responseError } from '../../shared/api/client'
import { ApiError } from '../../shared/api/errors'
import type { ChatConversation, ChatDocument, Citation, ConversationDetail } from './types'

export function createSummaryConversation(filename: string) {
  return apiRequest<ChatConversation>('/v1/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: `Summary: ${filename}` }),
  })
}

export function uploadSummaryDocument(conversationId: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest<ChatDocument>(`/v1/chats/${encodeURIComponent(conversationId)}/documents`, {
    method: 'POST',
    body,
  })
}

export function getSummaryConversation(conversationId: string) {
  return apiRequest<ConversationDetail>(`/v1/chats/${encodeURIComponent(conversationId)}`)
}

export async function waitForSummaryDocument(
  conversationId: string,
  documentId: string,
  onUpdate: (document: ChatDocument) => void,
  signal?: AbortSignal,
) {
  for (;;) {
    if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError')
    const detail = await getSummaryConversation(conversationId)
    const document = detail.documents.find((candidate) => candidate.id === documentId)
    if (!document) throw new Error('The uploaded document could not be found.')
    onUpdate(document)
    if (document.status === 'READY') return document
    if (document.status === 'FAILED') throw new Error(document.error || 'Document processing failed.')
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        window.clearTimeout(timeout)
        reject(new DOMException('Request cancelled', 'AbortError'))
      }
      const timeout = window.setTimeout(() => {
        signal?.removeEventListener('abort', onAbort)
        resolve()
      }, 1200)
      signal?.addEventListener('abort', onAbort, { once: true })
    })
  }
}

export async function streamSummary(
  conversationId: string,
  prompt: string,
  handlers: {
    onCitations: (citations: Citation[]) => void
    onToken: (token: string) => void
  },
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${API_BASE_URL}/v1/chats/${encodeURIComponent(conversationId)}/messages/stream`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ content: prompt }),
      signal,
    },
  )
  if (!response.ok) throw new ApiError(await responseError(response), response.status)
  if (!response.body) throw new Error('The browser could not read the summary stream.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  for (;;) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n')
    let boundary = buffer.indexOf('\n\n')
    while (boundary >= 0) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      if (handleEvent(block, handlers) === 'done') completed = true
      boundary = buffer.indexOf('\n\n')
    }
    if (done) break
  }
  if (!completed) throw new Error('The summary stream ended before completion.')
}

function handleEvent(
  block: string,
  handlers: { onCitations: (citations: Citation[]) => void; onToken: (token: string) => void },
): string | undefined {
  const lines = block.split('\n')
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim()
  const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n')
  if (!event || !data) return undefined
  const payload = JSON.parse(data) as unknown
  if (event === 'citations') handlers.onCitations(payload as Citation[])
  if (event === 'token') handlers.onToken((payload as { content: string }).content)
  if (event === 'error') throw new Error((payload as { detail?: string }).detail || 'Summary generation failed.')
  return event
}
