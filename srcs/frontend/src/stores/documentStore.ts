import { create } from 'zustand';
import type { Document } from '@/types/document';
import apiClient from '@/services/api/client';
import { toast } from '@/stores/toastStore';

interface DocumentState {
  documents: Document[];
  myDocuments: Document[];
  isUploading: boolean;
  uploadProgress: number;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDragging: (isDragging: boolean) => void;
  uploadFile: (file: File, projectId: string | number) => Promise<Document | undefined>;
  deleteDocument: (id: string | number) => Promise<void>;
  fetchDocuments: (projectId: string | number) => Promise<void>;
  fetchMyDocuments: () => Promise<void>;
  downloadDocument: (doc: Document) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  myDocuments: [],
  isUploading: false,
  uploadProgress: 0,
  isDragging: false,
  isLoading: false,
  error: null,

  setDragging: (isDragging) => set({ isDragging }),

  uploadFile: async (file: File, projectId: string | number) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const response = await apiClient.post<Document>(
        `/api/documents/projects/${projectId}/documents/`, 
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              set({ uploadProgress: percentCompleted });
            }
          },
        }
      );

      set((state) => ({
        documents: [response.data, ...state.documents],
        myDocuments: [response.data, ...state.myDocuments],
        isUploading: false,
        uploadProgress: 0,
      }));
      return response.data;
    } catch (error: any) {
      console.error('Upload failed:', error);
      set({ isUploading: false, uploadProgress: 0, error: error.message || 'Upload failed' });
      throw error;
    }
  },

  deleteDocument: async (id: string | number) => {
    try {
      try {
        await apiClient.delete(`/api/documents/${id}/`);
      } catch (err) {
        await apiClient.delete(`/api/documents/documents/${id}/`);
      }
      set((state) => ({
        documents: state.documents.filter((doc) => String(doc.id) !== String(id)),
        myDocuments: state.myDocuments.filter((doc) => String(doc.id) !== String(id)),
      }));
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  },

  fetchDocuments: async (projectId: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Document[]>(`/api/documents/projects/${projectId}/documents/`);
      set({ documents: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      set({ isLoading: false, error: error.message || 'Failed to fetch documents' });
    }
  },

  fetchMyDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Document[]>('/api/documents/my/');
      set({ myDocuments: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch my documents:', error);
      set({ isLoading: false, error: error.message || 'Failed to fetch your documents' });
    }
  },

  downloadDocument: async (doc: Document) => {
    try {
      let response;
      try {
        response = await apiClient.get(`/api/documents/${doc.id}/download/`, {
          responseType: 'blob',
        });
      } catch (err) {
        response = await apiClient.get(`/api/documents/documents/${doc.id}/download/`, {
          responseType: 'blob',
        });
      }
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name || doc.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Authenticated download failed:', error);
      toast.error('Failed to download file. Please check your permissions.');
    }
  },
}));
