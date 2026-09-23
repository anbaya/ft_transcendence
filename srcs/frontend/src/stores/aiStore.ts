import { create } from 'zustand';
import type { AIConversation, AIMessage, RAGSource } from '@/types/ai';

interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Actions
  togglePanel: (open?: boolean) => void;
  setActiveConversation: (id: string) => void;
  createNewConversation: (projectId?: string) => string;
  sendMessage: (content: string, projectId?: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  clearError: () => void;
}

const mockConversations: AIConversation[] = [
  {
    id: 'conv-1',
    title: 'Project Setup Questions',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How do I start the local development server?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'To start the local development server, you can run `npm run dev` in your terminal.\nMake sure you have installed all dependencies using `npm install` first.',
        timestamp: new Date(Date.now() - 86390000).toISOString(),
        sources: [
          {
            document_id: 'doc-1',
            filename: 'README.md',
            snippet: 'npm run dev',
          },
        ],
      },
    ],
  },
];

export const useAIStore = create<AIState>((set, get) => ({
  conversations: mockConversations,
  activeConversationId: mockConversations[0].id,
  isTyping: false,
  error: null,
  isPanelOpen: false,

  togglePanel: (open) => set((state) => ({ 
    isPanelOpen: open !== undefined ? open : !state.isPanelOpen 
  })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  createNewConversation: (projectId) => {
    const newId = `conv-${Date.now()}`;
    const newConv: AIConversation = {
      id: newId,
      title: 'New Conversation',
      project_id: projectId,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId,
      error: null,
    }));

    return newId;
  },

  deleteConversation: (id) => {
    set((state) => {
      const newConversations = state.conversations.filter(c => c.id !== id);
      return {
        conversations: newConversations,
        activeConversationId: state.activeConversationId === id 
          ? (newConversations[0]?.id || null) 
          : state.activeConversationId
      };
    });
  },

  clearError: () => set({ error: null }),

  sendMessage: async (content: string, projectId?: string) => {
    const state = get();
    let convId = state.activeConversationId;

    if (!convId) {
      convId = get().createNewConversation(projectId);
    }

    const userMsgId = `msg-${Date.now()}`;
    const userMessage: AIMessage = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    set((s) => ({
      conversations: s.conversations.map(c => 
        c.id === convId 
          ? { 
              ...c, 
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? content.slice(0, 30) + '...' : c.title,
              updated_at: new Date().toISOString()
            }
          : c
      ),
      isTyping: true,
      error: null,
    }));

    // Mock API delay (1 to 2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simple mock response generator
    let responseContent = "I'm a mock AI assistant. This is a simulated response.";
    let sources: RAGSource[] | undefined = undefined;

    if (content.toLowerCase().includes('error')) {
      // Simulate error
      set({ 
        isTyping: false, 
        error: "Failed to generate AI response. Please try again." 
      });
      return;
    }

    if (content.toLowerCase().includes('project') || projectId) {
      responseContent = "Based on the project context, here is the information you requested. We use a mock-first architecture to simulate these responses until the backend is fully integrated.";
      sources = [
        {
          document_id: `doc-mock`,
          filename: 'Project_Architecture.pdf',
          page_number: 12,
          snippet: '...utilizes a mock-first approach for independent frontend development...'
        }
      ];
    } else if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
      responseContent = "Hello! How can I help you with your project today?";
    }

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMessage: AIMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      sources,
    };

    // Add assistant message
    set((s) => ({
      conversations: s.conversations.map(c => 
        c.id === convId 
          ? { 
              ...c, 
              messages: [...c.messages, assistantMessage],
              updated_at: new Date().toISOString()
            }
          : c
      ),
      isTyping: false,
    }));
  },
}));
