export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  organization_id: string;
  deadline: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectMember {
  id: string;
  joined_at: string;
  project_id: string;
  user_id: string;
}
