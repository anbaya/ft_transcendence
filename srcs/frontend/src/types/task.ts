export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number | string;
  project_id: number | string;
  project_name?: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_by?: number | string;
  creator_id?: number | string;
  assignee_id?: number | string | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}
