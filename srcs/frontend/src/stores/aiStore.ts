import { create } from 'zustand';
import apiClient from '@/services/api/client';
import type { AIConversation, AIMessage, AIInteraction } from '@/types/ai';

interface AIState {
  selectedProjectId: number | null; // null represents General Mode
  messages: AIMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Compatibility with older components
  conversations: AIConversation[];
  activeConversationId: string | null;

  // Actions
  togglePanel: (open?: boolean) => void;
  setSelectedProjectId: (id: number | null) => void;
  fetchHistory: (projectId?: number | null) => Promise<void>;
  sendMessage: (content: string, projectIdOverride?: number | null) => Promise<void>;
  clearHistory: (projectIdOverride?: number | null) => Promise<void>;
  clearError: () => void;

  // Backward compatibility methods
  setActiveConversation: (id: string) => void;
  createNewConversation: (projectId?: string) => string;
  deleteConversation: (id: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  selectedProjectId: null,
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,
  isPanelOpen: false,

  conversations: [],
  activeConversationId: null,

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

      const conv: AIConversation = {
        id: targetId ? `proj-${targetId}` : 'general',
        title: targetId ? `Project #${targetId} Chat` : 'General Chat',
        project_id: targetId ? String(targetId) : undefined,
        messages: formatted,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({
        messages: formatted,
        conversations: [conv],
        activeConversationId: conv.id,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to load AI conversation history.';
      set({ isLoading: false, error: errMsg });
    }
  },

  sendMessage: async (content: string, projectIdOverride?: number | null) => {
    const targetId = projectIdOverride !== undefined ? projectIdOverride : get().selectedProjectId;
    
    const tempUserMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      projectId: targetId,
    };

    set((state) => {
      const nextMessages = [...state.messages, tempUserMsg];
      const conv: AIConversation = {
        id: targetId ? `proj-${targetId}` : 'general',
        title: targetId ? `Project #${targetId} Chat` : 'General Chat',
        project_id: targetId ? String(targetId) : undefined,
        messages: nextMessages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        messages: nextMessages,
        conversations: [conv],
        isTyping: true,
        error: null,
      };
    });

    try {
      const body = {
        question: content,
        project_id: targetId ? Number(targetId) : null,
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

      set((state) => {
        const nextMessages = [...state.messages, assistantMsg];
        const conv: AIConversation = {
          id: targetId ? `proj-${targetId}` : 'general',
          title: targetId ? `Project #${targetId} Chat` : 'General Chat',
          project_id: targetId ? String(targetId) : undefined,
          messages: nextMessages,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return {
          messages: nextMessages,
          conversations: [conv],
          isTyping: false,
        };
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to generate AI response.';
      set({ isTyping: false, error: errMsg });
    }
  },

  clearHistory: async (projectIdOverride?: number | null) => {
    const targetId = projectIdOverride !== undefined ? projectIdOverride : get().selectedProjectId;
    const queryParam = targetId ? String(targetId) : 'general';

    try {
      await apiClient.delete('/api/ai/history/', {
        params: { project_id: queryParam },
      });

      set({
        messages: [],
        conversations: [],
        error: null,
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to clear conversation history.';
      set({ error: errMsg });
    }
  },

  clearError: () => set({ error: null }),

  setActiveConversation: (_id) => {},
  createNewConversation: (_projectId) => {
    set({ messages: [] });
    return 'new';
  },
  deleteConversation: (_id) => {
    get().clearHistory();
  },
}));
