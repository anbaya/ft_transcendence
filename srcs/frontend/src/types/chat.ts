type ConversationType = 'Direct' | 'Project' | 'Group';

export interface Conversation {
  id: number;
  project_id: number;
  project_name?: string;
  created_at: string;
  type?: ConversationType;
  name?: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: number;
  conversation: number;
  conversation_id?: number;
  sender_id: number;
  sender_name?: string;
  content: string;
  created_at: string;
  sent_at?: string;
}

// Extended conversation model with UI-specific properties
export interface ChatThread extends Conversation {
  name: string;
  avatarUrl?: string;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}
