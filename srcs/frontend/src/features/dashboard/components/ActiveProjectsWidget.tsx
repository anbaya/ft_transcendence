import { useProjectStore } from '@/stores/projectStore';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

export function ActiveProjectsWidget() {
  const { projects } = useProjectStore();
  const navigate = useNavigate();
  
  // Show only up to 5 active projects
  const displayProjects = projects
    .filter(p => p.status !== 'completed')
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-primary">Active Projects</h3>
        <span className="text-xs font-medium text-muted">{displayProjects.length} projects</span>
      </div>

      <div className="divide-y divide-border">
        {displayProjects.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted">
            No active projects to display.
          </div>
        ) : (
          displayProjects.map((project) => (
            <div 
              key={project.id} 
              className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary truncate pr-2">{project.name}</span>
                <Badge variant={project.priority === 'high' ? 'error' : 'default'} className="text-[10px] capitalize">
                  {project.priority}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3">
                <Badge variant={project.status === 'in_progress' ? 'success' : 'default'} className="text-[10px] capitalize">
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted">
                  Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
