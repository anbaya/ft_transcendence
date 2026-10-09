import { create } from 'zustand';
import type { Document } from '@/types/document';
import apiClient from '@/services/api/client';

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

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isUploading: false,
  uploadProgress: 0,
  isDragging: false,

  setDragging: (isDragging) => set({ isDragging }),

  uploadFile: async (file: File, projectId?: string) => {
    if (!projectId) {
      console.error('Project ID is required to upload a document');
      return;
    }

    set({ isUploading: true, uploadProgress: 0 });
    
    const formData = new FormData();
    formData.append('file', file);
    // Add other fields if needed, like filename if backend requires it.

    try {
      const response = await apiClient.post<Document>(
        `/api/documents/projects/${projectId}/documents/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              set({ uploadProgress: percentCompleted });
            }
          },
        }
      );

      set(state => ({
        documents: [response.data, ...state.documents],
        isUploading: false,
        uploadProgress: 0
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      set({ isUploading: false, uploadProgress: 0 });
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await apiClient.delete(`/api/documents/documents/${id}/`);
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  },

  fetchDocuments: async (projectId?: string) => {
    if (!projectId) return;
    try {
      const response = await apiClient.get<Document[]>(`/api/documents/projects/${projectId}/documents/`);
      set({ documents: response.data });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }
}));
