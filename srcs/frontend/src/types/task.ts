export type TaskStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_by: string;
  assignee_id?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}
