import { create } from 'zustand';
import apiClient from '@/services/api/client';
import type { AIMessage, AIInteraction } from '@/types/ai';

interface AIState {
  selectedProjectId: number | null; // null represents General Mode
  messages: AIMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Actions
  togglePanel: (open?: boolean) => void;
  setSelectedProjectId: (id: number | null) => void;
  fetchHistory: (projectId?: number | null) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteConversation: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialAIState = {
  selectedProjectId: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,
  isPanelOpen: false,
};

export const useAIStore = create<AIState>((set, get) => ({
  ...initialAIState,
  reset: () => set(initialAIState),

  togglePanel: (open) => set((state) => ({
    isPanelOpen: open !== undefined ? open : !state.isPanelOpen
  })),

  setSelectedProjectId: (id) => {
    set({ selectedProjectId: id });
    get().fetchHistory(id);
  },

  fetchHistory: async (projectId?: number | null) => {
    const targetId = projectId !== undefined ? projectId : get().selectedProjectId;
    const queryParam = targetId ? String(targetId) : 'general';

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<AIInteraction[]>('/api/ai/history/', {
        params: { project_id: queryParam },
      });

      const formatted: AIMessage[] = [];
      (response.data || []).forEach((item) => {
        formatted.push({
          id: `q-${item.id}`,
          role: 'user',
          content: item.question,
          timestamp: item.created_at,
          projectId: item.project_id,
        });
        formatted.push({
          id: `a-${item.id}`,
          role: 'assistant',
          content: item.answer,
          timestamp: item.created_at,
          projectId: item.project_id,
        });
      });

      set({
        messages: formatted,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to load AI conversation history.';
      set({ isLoading: false, error: errMsg });
    }
  },

  sendMessage: async (content: string) => {
    const targetId = get().selectedProjectId;
    
    const tempUserMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      projectId: targetId,
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isTyping: true,
      error: null,
    }));

    try {
      const body = {
        question: content,
        project_id: targetId,
      };

      const response = await apiClient.post<{
        answer: string;
        mode: string;
        project_id?: number | null;
      }>('/api/ai/ask/', body);

      const assistantMsg: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.answer || 'No response returned.',
        timestamp: new Date().toISOString(),
        projectId: response.data.project_id ?? targetId,
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isTyping: false,
      }));
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to generate AI response.';
      set({ isTyping: false, error: errMsg });
    }
  },

  clearHistory: async () => {
    const targetId = get().selectedProjectId;
    const queryParam = targetId ? String(targetId) : 'general';

    try {
      await apiClient.delete('/api/ai/history/', {
        params: { project_id: queryParam },
      });

      set({
        messages: [],
        error: null,
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to delete conversation.';
      set({ error: errMsg });
    }
  },

  deleteConversation: async () => {
    return get().clearHistory();
  },

  clearError: () => set({ error: null }),
}));
