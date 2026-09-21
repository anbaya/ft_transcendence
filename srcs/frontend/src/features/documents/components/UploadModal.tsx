import React, { useCallback, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, File as FileIcon, CheckCircle2 } from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function UploadModal({ isOpen, onOpenChange, projectId }: UploadModalProps) {
  const { isUploading, uploadProgress, uploadFile, isDragging, setDragging } = useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, [setDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, [setDragging]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0], projectId);
      setTimeout(() => onOpenChange(false), 800); // Close shortly after completion
    }
  }, [setDragging, uploadFile, projectId, onOpenChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0], projectId);
      setTimeout(() => onOpenChange(false), 800);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={isUploading ? undefined : onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-5">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-primary">
              Upload Document
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Drag and drop your files here or click to browse.
            </Dialog.Description>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
              isDragging 
                ? "border-secondary bg-indigo-50/50" 
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50",
              isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"
            )}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.fig,.md,.txt,.doc,.docx"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <UploadCloud className="h-6 w-6 text-secondary" />
            </div>
            <p className="mb-1 text-sm font-semibold text-primary">
              Click to upload <span className="font-normal text-muted">or drag and drop</span>
            </p>
            <p className="text-xs text-muted/80">
              PDF, PNG, JPG, MD, TXT (max. 10MB)
            </p>
          </div>

          {isUploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50 text-secondary shrink-0">
                  <FileIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-primary truncate max-w-[200px]">Uploading file...</span>
                    <span className="text-muted">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-secondary transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                {uploadProgress === 100 && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in" />
                )}
              </div>
            </div>
          )}

          <Dialog.Close asChild>
            <button
              disabled={isUploading}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4 text-slate-500" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
