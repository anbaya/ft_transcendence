import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Download, Trash2, Calendar, HardDrive, User, Tag } from 'lucide-react';
import type { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentDetailsPanelProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function DocumentDetailsPanel({ document, isOpen, onClose, onDelete, onDownload }: DocumentDetailsPanelProps) {
  if (!document) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-sm border-l bg-white shadow-2xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-primary truncate pr-4">
              {document.filename}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary">
                <X className="h-5 w-5 text-slate-500" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="flex flex-col items-center justify-center py-8 mb-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-20 w-20 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-secondary opacity-80" />
              </div>
              <h3 className="font-medium text-primary max-w-[250px] truncate">{document.filename}</h3>
              <p className="text-sm text-muted mt-1">{formatSize(document.file_size)}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <Tag className="h-4 w-4" />
                      <span>Type</span>
                    </div>
                    <span className="font-medium text-primary">{getExtension(document.filename)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <HardDrive className="h-4 w-4" />
                      <span>Size</span>
                    </div>
                    <span className="font-medium text-primary">{formatSize(document.file_size)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded</span>
                    </div>
                    <span className="font-medium text-primary">
                      {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <User className="h-4 w-4" />
                      <span>By</span>
                    </div>
                    <span className="font-medium text-primary">{document.uploader_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border p-6 flex gap-3">
            <button
              onClick={() => {
                onDownload(document.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={() => {
                onDelete(document.id);
                onClose();
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
