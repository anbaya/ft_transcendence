import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/utils/errors';
import { useNavigate } from 'react-router-dom';

interface LeaveProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectId: number;
}

export function LeaveProjectModal({ open, onOpenChange, projectName, projectId }: LeaveProjectModalProps) {
  const { leaveProject, isLoading } = useProjectStore();
  const navigate = useNavigate();

  const handleLeave = async () => {
    try {
      if (projectId) {
        await leaveProject(projectId);
        toast.success(`You have left "${projectName}"`);
        onOpenChange(false);
        navigate('/projects');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(getApiErrorMessage(error, 'Failed to leave project'));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2 text-warning mb-2">
              <LogOut className="h-5 w-5" />
              <ModalTitle>Leave Project</ModalTitle>
            </div>
            <ModalDescription>
              Are you sure you want to leave <span className="font-medium text-primary">{projectName}</span>? 
              You will lose access to all project resources and will need to be re-invited to rejoin.
            </ModalDescription>
          </ModalHeader>

          <ModalFooter className="mt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeave} isLoading={isLoading}>
              Leave Project
            </Button>
          </ModalFooter>

          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
