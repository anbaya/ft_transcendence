export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  projectId?: number | null;
}

export interface AIInteraction {
  id: number;
  user_id: number;
  project_id: number | null;
  question: string;
  answer: string;
  created_at: string;
}
