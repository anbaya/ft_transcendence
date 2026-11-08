import { useState } from 'react';
import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/utils/errors';
import type { TaskStatus, TaskPriority } from '@/types/task';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectDeadline?: string | null;
}

export function CreateTaskModal({ open, onOpenChange, projectId, projectDeadline }: CreateTaskModalProps) {
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
  const projectDeadlineDate = projectDeadline ? projectDeadline.split('T')[0] : null;
  const isDeadlineExceedsProject = Boolean(projectDeadlineDate && formData.deadline && formData.deadline > projectDeadlineDate);
  
  const handleSubmit = async () => {
    if (!formData.title.trim() || !projectId) return;
    if (isDeadlineInvalid) {
      toast.error('Deadline cannot be in the past');
      return;
    }
    if (isDeadlineExceedsProject) {
      toast.error('Task deadline cannot exceed project deadline.');
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
      toast.error(getApiErrorMessage(error, 'Failed to create task'));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Create Task</ModalTitle>
            <ModalDescription>
              Add a new task and assign it to a project member.
            </ModalDescription>
          </ModalHeader>
          
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
              <label className="field-label">
                Description
              </label>
              <textarea
                placeholder="Brief description of the task..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="field min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="field-label">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="field h-10"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="field-label">
                  Priority
                </label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="field h-10"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="field-label">
                Assignee
              </label>
              <select 
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="field h-10"
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
              max={projectDeadlineDate || undefined}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              error={isDeadlineInvalid ? 'Deadline cannot be in the past' : isDeadlineExceedsProject ? 'Task deadline cannot exceed project deadline.' : undefined}
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              isLoading={isLoading} 
              disabled={!formData.title.trim() || isDeadlineInvalid || isDeadlineExceedsProject}
            >
              Create Task
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
