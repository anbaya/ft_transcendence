import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/stores/projectStore';
import { useState } from 'react';

interface AddProjectMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function AddProjectMemberModal({ open, onOpenChange, projectId }: AddProjectMemberModalProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addProjectMember } = useProjectStore();

  const handleAdd = async () => {
    if (!email.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      await addProjectMember(projectId, email.trim());
      setEmail('');
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || err.message || 'Failed to add member';
      setError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Project Member</ModalTitle>
            <ModalDescription>
              Invite a registered user to this project by their email address.
            </ModalDescription>
          </ModalHeader>
          
          <div className="py-4 space-y-4">
            <Input
              label="User Email"
              placeholder="collaborator@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isAdding || !email.trim()}>
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
