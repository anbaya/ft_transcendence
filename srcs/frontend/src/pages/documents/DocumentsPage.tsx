import { useState, useEffect } from 'react';
import { Upload, FileText, Search } from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useProjectStore } from '@/stores/projectStore';
import { DocumentListTable } from '@/features/documents/components/DocumentListTable';
import { UploadModal } from '@/features/documents/components/UploadModal';
import { DocumentDetailsPanel } from '@/features/documents/components/DocumentDetailsPanel';
import type { Document } from '@/types/document';
import { cn } from '@/utils/cn';

type FilterType = 'All' | 'PDF' | 'Images' | 'Other';

export function DocumentsPage() {
  const { documents, deleteDocument, fetchDocuments } = useDocumentStore();
  const { activeProject } = useProjectStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (activeProject?.id) {
      fetchDocuments(String(activeProject.id));
    }
  }, [activeProject]);

  const filteredDocuments = documents.filter((doc) => {
    // Search matching
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type matching
    let matchesType = true;
    if (activeFilter === 'PDF') {
      matchesType = doc.file_type === 'application/pdf';
    } else if (activeFilter === 'Images') {
      matchesType = doc.file_type.startsWith('image/') || doc.filename.match(/\.(jpg|jpeg|png|gif)$/i) !== null;
    } else if (activeFilter === 'Other') {
      matchesType = doc.file_type !== 'application/pdf' && !doc.file_type.startsWith('image/');
    }

    return matchesSearch && matchesType;
  });

  const handleDownload = (id: string) => {
    // Navigate to the download endpoint which triggers the browser to download the file
    window.location.href = `/api/documents/documents/${id}/download/`;
  };

  return (
    <div className="flex h-full flex-col px-4 py-8 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText className="h-6 w-6 text-secondary" />
            Documents
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your project files, assets, and reports securely.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
        {/* Filters */}
        <div className="flex gap-2 border-b border-border sm:border-none pb-px sm:pb-0">
          {(['All', 'PDF', 'Images', 'Other'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium sm:rounded-md transition-colors",
                activeFilter === filter 
                  ? "border-b-2 sm:border-none border-secondary text-secondary sm:bg-indigo-50" 
                  : "border-b-2 sm:border-none border-transparent text-muted hover:text-primary hover:bg-slate-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-shadow"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <DocumentListTable 
          documents={filteredDocuments}
          onViewDetails={setSelectedDoc}
          onDownload={handleDownload}
          onDelete={deleteDocument}
        />
      </div>

      {/* Modals & Overlays */}
      <UploadModal 
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        projectId={activeProject ? String(activeProject.id) : undefined}
      />

      <DocumentDetailsPanel 
        document={selectedDoc}
        isOpen={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
        onDelete={deleteDocument}
      />
    </div>
  );
}
