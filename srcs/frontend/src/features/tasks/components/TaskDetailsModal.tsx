import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2, Clock, User, Calendar, Edit, Trash2, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Task } from '@/types/task';

interface TaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function TaskDetailsModal({ open, onOpenChange, task, onEditClick, onDeleteClick }: TaskDetailsModalProps) {
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
                <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
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
            <Button variant="ghost" className="text-error hover:text-error hover:bg-error/10" onClick={onDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={onEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
