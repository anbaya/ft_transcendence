export type NotificationType = 'task_assigned' | 'message_received' | 'project_update' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // UI helper for grouping or navigation, e.g. /tasks/123 or /chat
  link?: string;
}
