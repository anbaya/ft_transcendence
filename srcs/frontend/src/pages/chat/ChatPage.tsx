import { useState, useEffect } from 'react';
import { ConversationList, type ChatThread } from '@/features/chat/components/ConversationList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Message, Conversation } from '@/types/chat';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import apiClient from '@/services/api/client';
import { wsClient } from '@/services/websocket/client';
import { WS_EVENTS } from '@/services/websocket/events';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { activeProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ChatThread | null>(null);

  // 1. Fetch project conversation when activeProject changes
  useEffect(() => {
    async function loadProjectChat() {
      if (!activeProject?.id) {
        setConversation(null);
        setMessages([]);
        return;
      }
      try {
        const convRes = await apiClient.get<Conversation>(`/api/conversations/projects/${activeProject.id}/`);
        const convData = convRes.data;
        const thread: ChatThread = {
          ...convData,
          name: `${activeProject.name} Chat`,
        };
        setConversation(thread);
        setSelectedConvId(thread.id);

        // Fetch messages
        const msgRes = await apiClient.get<Message[]>(`/api/conversations/${thread.id}/messages/`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    }
    loadProjectChat();
  }, [activeProject]);

  // 2. Connect to WebSocket and subscribe to messages
  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.on(WS_EVENTS.MESSAGE_NEW, (payload: Message) => {
      setMessages(prev => {
        // Prevent duplicate messages in case we already have it
        if (prev.some(m => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!selectedConvId || !user?.id) return;
    try {
      // Actually send to backend via API
      await apiClient.post(`/api/conversations/${selectedConvId}/messages/`, {
        content
      });
      // The message will be broadcasted back via WebSocket and added to the list automatically!
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const conversationsData = conversation ? [conversation] : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden -mx-8 -my-8 sm:mx-0 sm:my-0 sm:h-[calc(100vh-8rem)] sm:rounded-xl sm:border sm:border-border sm:shadow-sm">
      <div className={`w-full sm:w-80 md:w-96 flex-shrink-0 ${selectedConvId ? 'hidden sm:block' : 'block'}`}>
        <ConversationList 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          conversations={conversationsData}
          selectedId={selectedConvId}
          onSelect={setSelectedConvId}
        />
      </div>

      <div className={`flex-1 min-w-0 ${!selectedConvId ? 'hidden sm:flex' : 'flex'}`}>
        <ChatWindow 
          conversation={conversation}
          messages={messages}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
