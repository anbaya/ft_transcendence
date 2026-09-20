import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';

interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  project: string;
  category: string;
  time: string;
}

const mockTasks: Task[] = [
  { id: '1', name: 'Design system tokens', priority: 'high', project: 'Website', category: 'Design', time: '2h ago' },
  { id: '2', name: 'Fix API endpoint', priority: 'high', project: 'Mobile App', category: 'Dev', time: '30m ago' },
  { id: '3', name: 'Update documentation', priority: 'medium', project: 'Website', category: 'Docs', time: '1h ago' },
  { id: '4', name: 'Review PR #42', priority: 'medium', project: 'Mobile App', category: 'Dev', time: '3h ago' },
  { id: '5', name: 'Send weekly report', priority: 'low', project: 'Business', category: 'Comms', time: '4h ago' },
  { id: '6', name: 'Plan sprint retro', priority: 'low', project: 'Website', category: 'Planning', time: '5h ago' },
  { id: '7', name: 'Deploy staging build', priority: 'high', project: 'Mobile App', category: 'Dev', time: '6h ago' },
];

const priorityConfig = {
  high: { dot: 'bg-red-500', variant: 'error' as const },
  medium: { dot: 'bg-amber-500', variant: 'warning' as const },
  low: { dot: 'bg-slate-400', variant: 'default' as const },
};

export function TaskFeed() {
  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-primary">Today's Tasks</h3>
        <span className="text-xs font-medium text-muted">{mockTasks.length} tasks</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', priorityConfig[task.priority].dot)} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate">{task.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {task.project} · {task.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Badge variant={priorityConfig[task.priority].variant} className="capitalize text-[10px] h-5 px-1.5">
                {task.priority}
              </Badge>
              <span className="text-xs text-muted whitespace-nowrap">{task.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
