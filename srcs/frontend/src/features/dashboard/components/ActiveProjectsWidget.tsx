import * as Progress from '@radix-ui/react-progress';

interface Project {
  id: string;
  name: string;
  progress: number; // 0–100
  color: string;    // Tailwind bg class
}

const mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', progress: 75, color: 'bg-secondary' },
  { id: '2', name: 'Mobile App', progress: 67, color: 'bg-violet-500' },
  { id: '3', name: 'Marketing Campaign', progress: 50, color: 'bg-amber-500' },
  { id: '4', name: 'API Integration', progress: 30, color: 'bg-emerald-500' },
];

export function ActiveProjectsWidget() {
  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-primary">Active Projects</h3>
        <span className="text-xs font-medium text-muted">{mockProjects.length} projects</span>
      </div>

      <div className="divide-y divide-border">
        {mockProjects.map((project) => (
          <div key={project.id} className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">{project.name}</span>
              <span className="text-xs font-semibold text-muted">{project.progress}%</span>
            </div>

            <Progress.Root
              className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100"
              value={project.progress}
            >
              <Progress.Indicator
                className={`h-full rounded-full transition-transform duration-500 ease-out ${project.color}`}
                style={{ width: `${project.progress}%` }}
              />
            </Progress.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
