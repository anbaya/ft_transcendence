import { Link } from 'react-router-dom';
import { FolderKanban, ArrowRight, MoreHorizontal, Edit, Trash2, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onLeave?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onLeave }: ProjectCardProps) {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || project.created_by === user?.id;

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Planned';
    return status.replace('_', ' ');
  };

  const getAccentClass = (status: string) => {
    switch (status) {
      case 'completed': return 'project-card-accent-completed';
      case 'in_progress': return 'project-card-accent-in_progress';
      case 'cancelled': return 'project-card-accent-cancelled';
      default: return 'project-card-accent-default';
    }
  };

  const getIconClass = (status: string) => {
    switch (status) {
      case 'completed': return 'project-icon-completed';
      case 'in_progress': return 'project-icon-in_progress';
      case 'cancelled': return 'project-icon-cancelled';
      default: return 'project-icon-default';
    }
  };

  return (
    <div className={cn("project-card", getAccentClass(project.status), "group")}>
      <div>
        <div className="flex items-start justify-between">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", getIconClass(project.status))}>
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getStatusVariant(project.status)} 
              className="text-xs"
            >
              {formatStatus(project.status)}
            </Badge>
            {(canManage || onLeave) && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-white p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                    {canManage ? (
                      <>
                        <DropdownMenu.Item 
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={() => onEdit(project)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
                        <DropdownMenu.Item 
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-error outline-none transition-colors focus:bg-error/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={() => onDelete(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenu.Item>
                      </>
                    ) : onLeave ? (
                      <DropdownMenu.Item 
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-warning outline-none transition-colors focus:bg-warning/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        onClick={() => onLeave(project)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave Project
                      </DropdownMenu.Item>
                    ) : null}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        </div>
        
        <h3 className="mt-4 text-lg font-semibold text-primary">{project.name}</h3>
        <p className="mt-1 text-sm text-muted line-clamp-2 h-10">
          {project.description}
        </p>
      </div>
      
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex justify-between text-xs text-muted">
          <span className="capitalize">Priority: {project.priority}</span>
          <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
        </div>
        <Link to={`/projects/${project.id}`}>
          <Button variant="secondary" className="w-full group-hover:bg-indigo-50 transition-colors">
            View Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
