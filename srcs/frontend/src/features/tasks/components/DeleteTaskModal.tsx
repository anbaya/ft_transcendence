import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTaskStore } from '@/stores/taskStore';
import { toast } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/utils/errors';

interface DeleteTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  taskId?: number;
}

export function DeleteTaskModal({ open, onOpenChange, taskTitle, taskId }: DeleteTaskModalProps) {
  const { deleteTask, isLoading } = useTaskStore();

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(getApiErrorMessage(error, 'Failed to delete task'));
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
                Delete Task
              </ModalTitle>
            </div>
            <ModalDescription>
              Are you sure you want to delete <span className="font-medium text-primary">{taskTitle}</span>? 
              This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          
          <ModalFooter className="mt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isLoading}>
              Delete Task
            </Button>
          </ModalFooter>
          
          <ModalClose />
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
