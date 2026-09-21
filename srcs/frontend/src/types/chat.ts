export type ConversationType = 'Direct' | 'Project' | 'Group';

export interface Conversation {
  id: string;
  type: ConversationType;
  created_at: string;
  project_id?: string;
  // UI helper properties (not in raw schema, but useful for display)
  name?: string; 
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  updated_at: string;
}
