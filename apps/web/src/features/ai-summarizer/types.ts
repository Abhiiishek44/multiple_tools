export type ChatConversation = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type ChatDocument = {
  id: string
  filename: string
  media_type: string
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED'
  error: string | null
  created_at: string
  processed_at: string | null
}

export type Citation = {
  document_id: string
  filename: string
  chunk_index: number
  excerpt: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations: Citation[]
  created_at: string | null
}

export type ConversationDetail = {
  conversation: ChatConversation
  documents: ChatDocument[]
  messages: ChatMessage[]
}
