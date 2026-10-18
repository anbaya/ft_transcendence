type NotificationType = 'task_assigned' | 'message_received' | 'project_update' | 'system';

export interface Notification {
  id: number | string;
  user_id: number | string;
  title: string;
  message: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  type?: NotificationType;
  link?: string;
}
