import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { getApiErrorMessage } from '@/utils/errors';
import { toast } from '@/stores/toastStore';
import { useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddProjectMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function AddProjectMemberModal({ open, onOpenChange, projectId }: AddProjectMemberModalProps) {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addProjectMember, activeProjectMembers } = useProjectStore();
  const { user } = useAuthStore();

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter a user email address.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (user?.email && cleanEmail.toLowerCase() === user.email.toLowerCase()) {
      setError('You are already a member of this project.');
      return;
    }
    const alreadyMember = activeProjectMembers.some(
      (m) => m.email?.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (alreadyMember) {
      setError('This user is already a member of this project.');
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      await addProjectMember(projectId, cleanEmail);
      toast.success('Member added successfully');
      setEmail('');
      setError(null);
      onOpenChange(false);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Failed to add member');
      setError(msg);
      toast.error(msg);
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setEmail('');
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent>
          <form noValidate onSubmit={handleAdd}>
            <ModalHeader>
              <ModalTitle>Add Project Member</ModalTitle>
              <ModalDescription>
                Invite a registered user to this project by their email address.
              </ModalDescription>
            </ModalHeader>
            
            <div className="py-4 space-y-2">
              <Input
                label="User Email"
                placeholder="collaborator@example.com"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                error={error || undefined}
              />
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={handleClose} disabled={isAdding}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Member'}
              </Button>
            </ModalFooter>
            
            <ModalClose />
          </form>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
