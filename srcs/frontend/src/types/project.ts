export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  start_date?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  created_by: number;
  chat_sync_status?: 'pending' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  project?: number;
  project_id?: number;
  user_id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'PROJECT_MANAGER' | 'MEMBER';
  joined_at: string;
}
