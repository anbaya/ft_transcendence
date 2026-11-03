import { useState } from 'react';
import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import type { ProjectStatus, ProjectPriority } from '@/types/project';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { createProject, isLoading } = useProjectStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    deadline: '',
  });

  const today = new Date().toLocaleDateString('en-CA');
  const isDeadlineInvalid = Boolean(formData.deadline && formData.deadline < today);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    if (isDeadlineInvalid) {
      toast.error('Deadline must be a future date');
      return;
    }
    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        deadline: formData.deadline ? formData.deadline : null,
      });
      onOpenChange(false);
      toast.success('Project created successfully!');
      setFormData({ name: '', description: '', status: 'planned', priority: 'medium', deadline: '' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.name?.[0] || error.message || 'Failed to create project');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create Project</ModalTitle>
            <ModalDescription>
              Add a new project to start collaborating with your team.
            </ModalDescription>
          </ModalHeader>
          
          <div className="py-4 space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g. Website Redesign"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />

            <div className="space-y-1">
              <label className="field-label">Description</label>
              <textarea
                placeholder="Brief description of the project..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="field min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="field-label">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                  className="field h-10"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="field-label">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as ProjectPriority})}
                  className="field h-10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <Input
              label="Deadline"
              type="date"
              min={today}
              value={formData.deadline}
              error={isDeadlineInvalid ? 'Deadline must be a future date' : undefined}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              isLoading={isLoading} 
              disabled={!formData.name.trim() || isDeadlineInvalid}
            >
              Create Project
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
