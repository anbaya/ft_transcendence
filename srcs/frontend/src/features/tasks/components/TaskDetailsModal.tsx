import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { X, CheckCircle2, Clock, User, Calendar, Edit, Trash2, FolderKanban, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import type { Task } from '@/types/task';

interface TaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function TaskDetailsModal({ open, onOpenChange, task, onEditClick, onDeleteClick }: TaskDetailsModalProps) {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  if (!task) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'info';
      case 'In Review': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High': return 'error';
      case 'Medium': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-border bg-white p-6 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-l-xl flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="outline-none">
                    <Badge variant={getStatusVariant(task.status)} className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1">
                      {task.status}
                      <ChevronDown className="h-3 w-3" />
                    </Badge>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="start" className="z-[60] min-w-[140px] overflow-hidden rounded-md border border-border bg-white p-1 shadow-md">
                      {['Todo', 'In Progress', 'In Review', 'Done'].map((status) => (
                        <DropdownMenu.Item
                          key={status}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                        >
                          {status}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
              </div>
              <Dialog.Title className="text-xl font-bold tracking-tight text-primary">
                {task.title}
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2">
              <X className="h-5 w-5 text-muted" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-8">
            {/* Description Section */}
            <div>
              <h3 className="text-sm font-medium text-primary mb-2 flex items-center">
                <FolderKanban className="h-4 w-4 mr-2 text-muted" />
                Description
              </h3>
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-muted whitespace-pre-wrap border border-border">
                {task.description || "No description provided."}
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted" />
                  Assignee
                </h3>
                <p className="text-sm text-muted">
                  {task.assignee_id ? `User #${task.assignee_id}` : 'Unassigned'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted" />
                  Deadline
                </h3>
                <p className="text-sm text-muted">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-muted" />
                  Created By
                </h3>
                <p className="text-sm text-muted">User #{task.created_by}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted" />
                  Created At
                </h3>
                <p className="text-sm text-muted">
                  {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div>
              {canManage && (
                <Button variant="ghost" className="text-error hover:text-error hover:bg-error/10" onClick={onDeleteClick}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {canManage && (
                <Button onClick={onEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
