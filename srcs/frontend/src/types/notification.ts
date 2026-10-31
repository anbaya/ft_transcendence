type NotificationType = 'task_assigned' | 'message_received' | 'project_update' | 'system';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  type?: NotificationType;
  link?: string;
}
