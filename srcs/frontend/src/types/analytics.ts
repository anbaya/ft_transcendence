interface TaskAnalyticsStats {
  total: number;
  todo: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  status: string;
  priority: string;
  members_count: number;
  tasks: TaskAnalyticsStats;
}
