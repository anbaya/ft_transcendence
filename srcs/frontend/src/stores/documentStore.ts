import { create } from 'zustand';
import type { Document } from '@/types/document';

interface DocumentState {
  documents: Document[];
  isUploading: boolean;
  uploadProgress: number;
  isDragging: boolean;
  
  // Actions
  setDragging: (isDragging: boolean) => void;
  uploadFile: (file: File, projectId?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  fetchDocuments: (projectId?: string) => Promise<void>;
}

// Initial mock data
const mockDocs: Document[] = [
  {
    id: 'doc-1',
    uploader_id: 'user-1',
    filename: 'API-spec.pdf',
    file_type: 'application/pdf',
    file_size: 2400000, // 2.4 MB
    storage_path: '/docs/api-spec.pdf',
    uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'doc-2',
    uploader_id: 'user-2',
    filename: 'Wireframes.fig',
    file_type: 'application/octet-stream',
    file_size: 8100000, // 8.1 MB
    storage_path: '/docs/wireframes.fig',
    uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'doc-3',
    uploader_id: 'user-1',
    filename: 'logo-final.png',
    file_type: 'image/png',
    file_size: 340000,
    storage_path: '/docs/logo.png',
    uploaded_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'doc-4',
    uploader_id: 'user-3',
    filename: 'Meeting-notes.md',
    file_type: 'text/markdown',
    file_size: 12000,
    storage_path: '/docs/notes.md',
    uploaded_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  }
];

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: mockDocs,
  isUploading: false,
  uploadProgress: 0,
  isDragging: false,

  setDragging: (isDragging) => set({ isDragging }),

  uploadFile: async (file: File, projectId?: string) => {
    set({ isUploading: true, uploadProgress: 0 });
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      set({ uploadProgress: i });
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Create a mock document entry once "uploaded"
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      project_id: projectId,
      uploader_id: 'current-user',
      filename: file.name,
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      storage_path: `/docs/${file.name}`,
      uploaded_at: new Date().toISOString(),
    };

    set(state => ({
      documents: [newDoc, ...state.documents],
      isUploading: false,
      uploadProgress: 0
    }));
  },

  deleteDocument: async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== id)
    }));
  },

  fetchDocuments: async () => {
    // Mock fetch
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ documents: mockDocs });
  }
}));
