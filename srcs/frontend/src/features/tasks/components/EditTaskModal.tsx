import { useState, useEffect } from 'react';
import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import type { Task, TaskStatus, TaskPriority } from '@/types/task';

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function EditTaskModal({ open, onOpenChange, task }: EditTaskModalProps) {
  const { updateTask, isLoading } = useTaskStore();
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

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: (task.status as TaskStatus) || 'TODO',
        priority: (task.priority as TaskPriority) || 'MEDIUM',
        assignee_id: task.assignee_id ? String(task.assignee_id) : '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
      });
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    if (isDeadlineInvalid) {
      toast.error('Deadline cannot be in the past');
      return;
    }
    try {
      await updateTask(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id ? Number(formData.assignee_id) : null,
        deadline: formData.deadline ? formData.deadline : null,
      });
      onOpenChange(false);
      toast.success('Task updated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.title?.[0] || error.message || 'Failed to update task');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent className="max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Edit Task</ModalTitle>
            <ModalDescription>
              Update task information and assignments.
            </ModalDescription>
          </ModalHeader>
          
          <div className="py-4 space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              type="text"
              required
            />

            <div className="space-y-1">
              <label className="field-label">
                Description
              </label>
              <textarea
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
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              error={isDeadlineInvalid ? 'Deadline cannot be in the past' : undefined}
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              isLoading={isLoading} 
              disabled={!formData.title.trim() || isDeadlineInvalid}
            >
              Save Changes
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
