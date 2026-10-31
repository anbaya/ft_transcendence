import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import type { TaskStatus, TaskPriority } from '@/types/task';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function CreateTaskModal({ open, onOpenChange, projectId }: CreateTaskModalProps) {
  const { createTask, isLoading } = useTaskStore();
  const { activeProjectMembers } = useProjectStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    assignee_id: '',
    deadline: '',
  });
  
  const today = new Date().toLocaleDateString('en-CA');
  const isDeadlineInvalid = Boolean(formData.deadline && formData.deadline < today);
  
  const handleSubmit = async () => {
    if (!formData.title.trim() || !projectId) return;
    if (isDeadlineInvalid) {
      toast.error('Deadline cannot be in the past');
      return;
    }
    try {
      await createTask(Number(projectId), {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id ? Number(formData.assignee_id) : null,
        deadline: formData.deadline ? formData.deadline : null,
      });
      onOpenChange(false);
      toast.success('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee_id: '',
        deadline: '',
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.title?.[0] || error.message || 'Failed to create task');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-primary">
              Create Task
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Add a new task and assign it to a project member.
            </Dialog.Description>
          </div>
          
          <div className="py-4 space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Implement authentication"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-primary">
                Description
              </label>
              <textarea
                placeholder="Brief description of the task..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-primary">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-primary">
                  Priority
                </label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-primary">
                Assignee
              </label>
              <select 
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              >
                <option value="">Unassigned</option>
                {activeProjectMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.first_name ? `${member.first_name} ${member.last_name}` : member.email}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Deadline"
              type="date"
              min={today}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              error={isDeadlineInvalid ? 'Deadline cannot be in the past' : undefined}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              isLoading={isLoading} 
              disabled={!formData.title.trim() || isDeadlineInvalid}
            >
              Create Task
            </Button>
          </div>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 disabled:pointer-events-none text-primary">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
