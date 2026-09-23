export interface RAGSource {
  document_id: string;
  filename: string;
  page_number?: number;
  snippet?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: RAGSource[];
}

export interface AIConversation {
  id: string;
  title: string;
  project_id?: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}
