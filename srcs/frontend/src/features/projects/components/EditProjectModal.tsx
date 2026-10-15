import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import type { Project, ProjectStatus, ProjectPriority } from '@/types/project';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function EditProjectModal({ open, onOpenChange, project }: EditProjectModalProps) {
  const { updateProject, isLoading } = useProjectStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    deadline: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planned',
        priority: project.priority || 'medium',
        deadline: project.deadline?.split('T')[0] || '',
      });
    }
  }, [project]);

  if (!project) return null;

  const handleSubmit = async () => {
    try {
      await updateProject(project.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        deadline: formData.deadline ? formData.deadline : null,
      });
      onOpenChange(false);
      toast.success('Project updated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.name?.[0] || error.message || 'Failed to update project');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-primary">
              Edit Project
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Update project details and configuration.
            </Dialog.Description>
          </div>
          
          <div className="py-4 space-y-4">
            <Input
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              type="text"
              required
            />

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-primary">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-primary">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none text-primary">
                  Priority
                </label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as ProjectPriority})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <Input
              label="Deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              type="date"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-muted text-primary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
