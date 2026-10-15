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
  projectId?: number | null;
  sources?: RAGSource[];
}

export interface AIInteraction {
  id: number;
  user_id: number;
  project_id: number | null;
  question: string;
  answer: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  title: string;
  project_id?: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}
