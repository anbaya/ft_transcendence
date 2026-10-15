export type ConversationType = 'Direct' | 'Project' | 'Group';

export interface Conversation {
  id: number | string;
  project_id: number | string;
  project_name?: string;
  created_at: string;
  type?: ConversationType;
  name?: string;
  last_message?: string;
  last_message_at?: string;
}

export interface ConversationMember {
  id: number | string;
  conversation_id: number | string;
  user_id: number | string;
}

export interface Message {
  id: number | string;
  conversation: number | string;
  conversation_id?: number | string;
  sender_id: number | string;
  sender_name?: string;
  content: string;
  created_at: string;
  sent_at?: string;
}
