export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  project_id: number;
  project_name?: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  creator_id?: number;
  assignee_id?: number | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}
