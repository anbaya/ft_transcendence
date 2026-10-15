import { useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDocumentStore } from '@/stores/documentStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import type { Document } from '@/types/document';

interface ProjectDocumentsTabProps {
  projectId: string | number;
  canManage: boolean;
}

export function ProjectDocumentsTab({ projectId, canManage }: ProjectDocumentsTabProps) {
  const { user } = useAuthStore();
  const {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    fetchDocuments,
    uploadFile,
    deleteDocument,
    downloadDocument,
  } = useDocumentStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocuments(projectId);
  }, [projectId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file, projectId);
      toast.success('Document uploaded successfully!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err?.response?.data?.file?.[0] ||
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to upload document';
      toast.error(errMsg);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    try {
      await deleteDocument(doc.id);
      toast.success('Document deleted successfully');
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header with Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Project Documents</h2>
          <p className="text-sm text-muted">
            Share and manage project assets, specifications, and files.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload Document'}
          </Button>
        </div>
      </div>

      {/* Upload Progress Bar if active */}
      {isUploading && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex justify-between text-xs text-indigo-700 font-medium mb-1.5">
            <span>Uploading document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-indigo-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Documents List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center bg-white">
          <FileText className="mx-auto h-12 w-12 text-muted/50 mb-3" />
          <h3 className="text-lg font-semibold text-primary">No documents yet</h3>
          <p className="mt-1 text-sm text-muted max-w-sm">
            Upload project requirements, design mockups, or notes for your team.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload First File
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-border text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Uploaded By</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => {
                const canDelete =
                  canManage ||
                  String(doc.uploaded_by_id) === String(user?.id);

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-primary line-clamp-1">{doc.name}</p>
                          <p className="text-xs text-muted sm:hidden">
                            By {doc.uploaded_by_name || 'Member'} · {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-muted">
                      {doc.uploaded_by_name || 'Member'}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-primary"
                          onClick={() => downloadDocument(doc)}
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                            onClick={() => handleDelete(doc)}
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
