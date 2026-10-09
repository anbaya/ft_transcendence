import { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';

const priorityConfig: Record<string, { dot: string; variant: 'error' | 'warning' | 'default' }> = {
  'Urgent': { dot: 'bg-red-600', variant: 'error' },
  'High': { dot: 'bg-red-500', variant: 'error' },
  'Medium': { dot: 'bg-amber-500', variant: 'warning' },
  'Low': { dot: 'bg-slate-400', variant: 'default' },
};

export function TaskFeed() {
  const { myTasks, fetchMyTasks, isLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchMyTasks();
    if (projects.length === 0) fetchProjects();
  }, []);

  const getProjectName = (projectId: string) => {
    const p = projects.find((proj) => String(proj.id) === String(projectId));
    return p ? p.name : `Project #${projectId}`;
  };

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-primary">Today's Tasks</h3>
        <span className="text-xs font-medium text-muted">{myTasks.length} tasks</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted">Loading your tasks...</div>
        ) : myTasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted">No tasks assigned to you right now.</div>
        ) : (
          myTasks.map((task) => {
            const pConfig = priorityConfig[task.priority] || priorityConfig['Low'];
            return (
              <div
                key={task.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', pConfig.dot)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{task.title}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {getProjectName(task.project_id)} · {task.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={pConfig.variant} className="capitalize text-[10px] h-5 px-1.5">
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
