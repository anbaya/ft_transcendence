import { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { DocumentListTable } from '@/features/documents/components/DocumentListTable';
import { DocumentDetailsPanel } from '@/features/documents/components/DocumentDetailsPanel';
import type { Document } from '@/types/document';

type FilterType = 'All' | 'PDF' | 'Images' | 'Other';

export function DocumentsPage() {
  const { myDocuments, isLoading, deleteDocument, fetchMyDocuments, downloadDocument } = useDocumentStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const filteredDocuments = myDocuments.filter((doc) => {
    const docName = doc.name || doc.filename || '';
    // Search matching
    const matchesSearch =
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.project_name && doc.project_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type matching
    let matchesType = true;
    const isImage = docName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) !== null;
    const isPdf = docName.match(/\.pdf$/i) !== null;

    if (activeFilter === 'PDF') {
      matchesType = isPdf;
    } else if (activeFilter === 'Images') {
      matchesType = isImage;
    } else if (activeFilter === 'Other') {
      matchesType = !isPdf && !isImage;
    }

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex h-full flex-col px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileText className="h-6 w-6 text-secondary" />
          My Documents
        </h1>
        <p className="mt-1 text-sm text-muted">
          All documents shared and uploaded across your projects.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        {/* Filters */}
        <div className="tabs-pills">
          {(['All', 'PDF', 'Images', 'Other'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              data-state={activeFilter === filter ? 'active' : 'inactive'}
              className="tab-pill"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search documents or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-shadow"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted">Loading documents...</div>
        ) : (
          <DocumentListTable 
            documents={filteredDocuments}
            onViewDetails={setSelectedDoc}
            onDownload={downloadDocument}
            onDelete={deleteDocument}
          />
        )}
      </div>

      {/* Details Slide-over Panel */}
      <DocumentDetailsPanel 
        document={selectedDoc}
        isOpen={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        onDownload={downloadDocument}
        onDelete={deleteDocument}
      />
    </div>
  );
}
