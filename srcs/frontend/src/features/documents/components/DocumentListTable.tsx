import React, { useState } from 'react';
import type { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Image as ImageIcon, MoreHorizontal, Download, Eye, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/cn';

interface DocumentListTableProps {
  documents: Document[];
  onViewDetails: (doc: Document) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentListTable({ documents, onViewDetails, onDownload, onDelete }: DocumentListTableProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getIcon = (type: string, filename: string) => {
    if (type.startsWith('image/') || filename.match(/\.(jpg|jpeg|png|gif|fig)$/i)) {
      return <ImageIcon className="h-5 w-5 text-indigo-500" />;
    }
    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  const getExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-muted">
        <thead className="border-b border-border bg-slate-50/50 text-xs uppercase text-muted/70">
          <tr>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium hidden sm:table-cell">Type</th>
            <th className="px-6 py-4 font-medium hidden md:table-cell">Size</th>
            <th className="px-6 py-4 font-medium hidden lg:table-cell">Uploaded</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-primary">No documents found</p>
                <p className="text-xs text-muted mt-1">Try adjusting your filters or upload a new file.</p>
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr 
                key={doc.id} 
                className="group hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                      {getIcon(doc.file_type, doc.filename)}
                    </div>
                    <span className="font-medium text-primary">{doc.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {getExtension(doc.filename)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  {formatSize(doc.file_size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
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
                          onSelect={() => onDownload(doc.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-none hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <Download className="h-4 w-4 text-muted" />
                          Download
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px bg-border" />
                        <DropdownMenu.Item 
                          onSelect={() => onDelete(doc.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-error outline-none hover:bg-red-50 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
