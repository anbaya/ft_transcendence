import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/stores/projectStore';
import { useState } from 'react';
import { toast } from '@/stores/toastStore';

interface RemoveProjectMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: number;
  projectId: number;
  memberName?: string;
}

export function RemoveProjectMemberModal({ open, onOpenChange, memberId, projectId, memberName }: RemoveProjectMemberModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeProjectMember } = useProjectStore();

  const handleRemove = async () => {
    if (!memberId || !projectId) return;
    setIsDeleting(true);
    try {
      await removeProjectMember(projectId, memberId);
      toast.success('Member removed from project');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to remove member');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertTriangle className="h-5 w-5" />
              <ModalTitle>
                Remove Member
              </ModalTitle>
            </div>
            <ModalDescription>
              Are you sure you want to remove <span className="font-semibold text-primary">{memberName || 'this member'}</span> from this project? 
              They will no longer have access to this project's tasks and documents.
            </ModalDescription>
          </ModalHeader>
          
          <ModalFooter className="mt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isDeleting}>
              {isDeleting ? 'Removing...' : 'Remove Member'}
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
