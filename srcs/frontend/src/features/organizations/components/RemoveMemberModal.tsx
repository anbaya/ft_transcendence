import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOrganizationStore } from '@/stores/organizationStore';

interface RemoveMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  memberId: string;
  memberName: string;
  orgName: string;
}

export function RemoveMemberModal({ open, onOpenChange, orgId, memberId, memberName, orgName }: RemoveMemberModalProps) {
  const { removeOrganizationMember, isLoading } = useOrganizationStore();

  const handleRemove = async () => {
    try {
      await removeOrganizationMember(orgId, memberId);
      onOpenChange(false);
    } catch (e) {
      alert('Failed to remove member');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
              <AlertTriangle className="h-6 w-6 text-error" />
            </div>
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-primary">
              Remove Member?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Are you sure you want to remove <span className="font-medium text-primary">{memberName}</span> from <span className="font-medium text-primary">{orgName}</span>? This action cannot be undone.
            </Dialog.Description>
          </div>
          
          <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} isLoading={isLoading}>
              Remove Member
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
