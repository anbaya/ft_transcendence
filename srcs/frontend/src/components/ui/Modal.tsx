import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

// All the animation/data-state classes live here ONCE.
// They can't go in @apply (arbitrary variants aren't supported),
// so a component is the correct abstraction.

const OVERLAY_CLASSES =
  'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm ' +
  'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

const CONTENT_CLASSES =
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-md ' +
  'translate-x-[-50%] translate-y-[-50%] ' +
  'gap-4 border border-border bg-white p-6 shadow-lg duration-200 sm:rounded-lg ' +
  'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ' +
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ' +
  'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] ' +
  'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]';

/* ── Re-export Root & Portal unchanged ─────────────────── */
export const Modal        = Dialog.Root;
export const ModalPortal  = Dialog.Portal;
export const ModalTrigger = Dialog.Trigger;

/* ── Overlay ────────────────────────────────────────────── */
export function ModalOverlay({ className }: { className?: string }) {
  return <Dialog.Overlay className={cn(OVERLAY_CLASSES, className)} />;
}

/* ── Content ────────────────────────────────────────────── */
interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  className?: string;
}
export function ModalContent({ className, children, ...props }: ModalContentProps) {
  return (
    <Dialog.Content className={cn(CONTENT_CLASSES, className)} {...props}>
      {children}
    </Dialog.Content>
  );
}

/* ── Header ─────────────────────────────────────────────── */
export function ModalHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
}

/* ── Title ──────────────────────────────────────────────── */
export function ModalTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Dialog.Title className={cn('text-lg font-semibold leading-none tracking-tight text-primary', className)}>
      {children}
    </Dialog.Title>
  );
}

/* ── Description ────────────────────────────────────────── */
export function ModalDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Dialog.Description className={cn('text-sm text-muted', className)}>
      {children}
    </Dialog.Description>
  );
}

/* ── Footer ─────────────────────────────────────────────── */
export function ModalFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
}

/* ── Close button ───────────────────────────────────────── */
export function ModalClose({ disabled, className }: { disabled?: boolean; className?: string }) {
  return (
    <Dialog.Close
      disabled={disabled}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity',
        'hover:opacity-100 text-primary',
        'focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2',
        'disabled:pointer-events-none',
        'data-[state=open]:bg-slate-100 data-[state=open]:text-muted',
        className
      )}
    >
      <X className="h-4 w-4" />
    </Dialog.Close>
  );
}

