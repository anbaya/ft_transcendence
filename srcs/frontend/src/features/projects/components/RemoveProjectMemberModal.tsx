import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
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
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || 'Failed to remove member');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertTriangle className="h-5 w-5" />
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                Remove Member
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-muted">
              Are you sure you want to remove <span className="font-semibold text-primary">{memberName || 'this member'}</span> from this project? 
              They will no longer have access to this project's tasks and documents.
            </Dialog.Description>
          </div>
          
          <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isDeleting}>
              {isDeleting ? 'Removing...' : 'Remove Member'}
            </Button>
          </div>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-muted text-primary">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
