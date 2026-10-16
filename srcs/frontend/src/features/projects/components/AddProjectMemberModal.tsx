import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/stores/projectStore';
import { useState } from 'react';

interface AddProjectMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-primary">
              Add Project Member
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Invite a registered user to this project by their email address.
            </Dialog.Description>
          </div>
          
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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isAdding || !email.trim()}>
              {isAdding ? 'Adding...' : 'Add Member'}
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
