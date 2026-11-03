import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';

interface DeleteProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectId: number;
}

export function DeleteProjectModal({ open, onOpenChange, projectName, projectId }: DeleteProjectModalProps) {
  const { deleteProject, isLoading } = useProjectStore();

  const handleDelete = async () => {
    try {
      if (projectId) {
        await deleteProject(projectId);
        toast.success('Project deleted successfully');
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project');
    }
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2 text-error mb-2">
              <AlertTriangle className="h-5 w-5" />
              <ModalTitle>
                Delete Project
              </ModalTitle>
            </div>
            <ModalDescription>
              Are you sure you want to delete <span className="font-medium text-primary">{projectName}</span>? 
              This action cannot be undone. All tasks, documents, and data associated with this project will be permanently removed.
            </ModalDescription>
          </ModalHeader>
          
          <ModalFooter className="mt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isLoading}>
              Delete Project
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
