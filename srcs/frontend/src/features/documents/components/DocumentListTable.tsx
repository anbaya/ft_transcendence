import type { Document } from '@/types/document';
import { FileText, Image as ImageIcon, MoreHorizontal, Download, Eye, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface DocumentListTableProps {
  documents: Document[];
  onViewDetails: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (id: string | number) => void;
}

export function DocumentListTable({ documents, onViewDetails, onDownload, onDelete }: DocumentListTableProps) {
  const getIcon = (name: string) => {
    if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
      return <ImageIcon className="h-5 w-5 text-indigo-500" />;
    }
    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-muted">
        <thead className="border-b border-border bg-slate-50/50 text-xs uppercase text-muted/70">
          <tr>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium hidden sm:table-cell">Project</th>
            <th className="px-6 py-4 font-medium hidden md:table-cell">Uploaded By</th>
            <th className="px-6 py-4 font-medium hidden lg:table-cell">Uploaded</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-primary">No documents found</p>
                <p className="text-xs text-muted mt-1">No project files match your search criteria.</p>
              </td>
            </tr>
          ) : (
            documents.map((doc) => {
              const docName = doc.name || doc.filename || 'Untitled Document';
              return (
                <tr 
                  key={doc.id} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(doc)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                        {getIcon(docName)}
                      </div>
                      <div>
                        <span className="font-medium text-primary line-clamp-1">{docName}</span>
                        <span className="text-xs text-slate-400 sm:hidden">
                          {doc.project_name || 'Project'} · {doc.uploaded_by_name || 'Member'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {doc.project_name || `Project #${doc.project_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-slate-600">
                    {doc.uploaded_by_name || 'Member'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-slate-500">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary ml-auto">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="end"
                          className="z-50 min-w-[160px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80 zoom-in-95"
                        >
                          <DropdownMenu.Item 
                            onSelect={() => onViewDetails(doc)}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-none hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <Eye className="h-4 w-4 text-muted" />
                            View Details
                          </DropdownMenu.Item>
                          <DropdownMenu.Item 
                            onSelect={() => onDownload(doc)}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-none hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <Download className="h-4 w-4 text-muted" />
                            Download
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-border my-1" />
                          <DropdownMenu.Item 
                            onSelect={() => onDelete(doc.id)}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-error outline-none hover:bg-red-50 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
