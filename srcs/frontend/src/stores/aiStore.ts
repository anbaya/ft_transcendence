import { create } from 'zustand';
import apiClient from '@/services/api/client';
import { useAuthStore } from './authStore';
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

    const assistantMsgId = `assistant-${Date.now()}`;

    try {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json, */*',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/ask/?stream=true', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: content,
          project_id: targetId,
          stream: true,
        }),
      });

      // Handle Rate Limit (HTTP 429)
      if (response.status === 429) {
        let rateLimitMsg = 'Question limit reached. You have exceeded the allowed request quota. Please wait a moment before asking another question.';
        try {
          const errData = await response.json();
          if (errData?.detail) {
            rateLimitMsg = `Question limit reached: ${errData.detail}`;
          } else if (errData?.error) {
            rateLimitMsg = `Question limit reached: ${errData.error}`;
          }
        } catch (_) {}

        set({
          isTyping: false,
          error: rateLimitMsg,
        });
        return;
      }

      // Handle other non-200 responses
      if (!response.ok) {
        let errorMsg = 'Failed to generate AI response.';
        try {
          const errData = await response.json();
          errorMsg = errData?.detail || errData?.error || errData?.message || errorMsg;
        } catch (_) {}

        set({
          isTyping: false,
          error: errorMsg,
        });
        return;
      }

      // Handle SSE Streaming response
      if (!response.body) {
        throw new Error('Response stream is unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let accumulated = '';
      let hasReceivedChunk = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          try {
            const parsed = JSON.parse(trimmed.replace(/^data:\s*/, ''));
            if (parsed.error) {
              set({ error: parsed.error });
            }
            if (parsed.chunk) {
              accumulated += parsed.chunk;

              if (!hasReceivedChunk) {
                hasReceivedChunk = true;
                set((state) => ({
                  messages: [
                    ...state.messages,
                    {
                      id: assistantMsgId,
                      role: 'assistant',
                      content: accumulated,
                      timestamp: new Date().toISOString(),
                      projectId: targetId,
                    },
                  ],
                  isTyping: false,
                }));
              } else {
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  ),
                }));
              }
            }
          } catch (_) {}
        }
      }

      if (!hasReceivedChunk) {
        set((state) => ({
          isTyping: false,
          error: state.error || 'No response received from the server.',
        }));
      } else {
        set({ isTyping: false });
      }
    } catch (err: any) {
      set((state) => ({
        messages: state.messages.filter(
          (m) => m.id !== assistantMsgId || m.content.length > 0
        ),
        isTyping: false,
        error: err?.message || 'Failed to connect to the AI service.',
      }));
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

  clearError: () => set({ error: null }),
}));
