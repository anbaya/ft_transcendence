import { useState, useEffect, useRef } from 'react';
import { ConversationList } from '@/features/chat/components/ConversationList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Message, Conversation, ChatThread } from '@/types/chat';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api/client';
import { createProjectWebSocket, ProjectWebSocketClient } from '@/services/websocket/client';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const wsRef = useRef<ProjectWebSocketClient | null>(null);

  // 1. Fetch user's active conversations on mount
  useEffect(() => {
    async function loadMyConversations() {
      try {
        const response = await apiClient.get<Conversation[]>('/api/conversations/my/');
        const threads: ChatThread[] = response.data.map((conv) => ({
          ...conv,
          name: conv.project_name ? `${conv.project_name} Chat` : `Project #${conv.project_id} Chat`,
        }));
        setConversations(threads);
        if (threads.length > 0 && !selectedConvId) {
          setSelectedConvId(threads[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    }
    loadMyConversations();
  }, []);

  // 2. When selected conversation changes, load messages & connect its WebSocket
  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || null;

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const currentConv = selectedConversation;
    let isMounted = true;

    // Load message history
    async function loadMessages() {
      try {
        const msgRes = await apiClient.get<Message[]>(`/api/conversations/${currentConv.id}/messages/`);
        if (isMounted) {
          setMessages(msgRes.data);
        }
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
      }
    }
    loadMessages();

    // Connect WebSocket for this project
    const ws = createProjectWebSocket(currentConv.project_id, (incomingMsg) => {
      if (!isMounted) return;
      setMessages((prev) => {
        if (incomingMsg.id && prev.some((m) => m.id === incomingMsg.id)) {
          return prev;
        }
        return [...prev, incomingMsg];
      });
    });
    wsRef.current = ws;

    return () => {
      isMounted = false;
      ws.disconnect();
    };
  }, [selectedConversation?.id, selectedConversation?.project_id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user?.id) return;

    // Try WS first
    if (wsRef.current) {
      wsRef.current.sendMessage(content);
    } else if (selectedConvId) {
      // Fallback to REST API
      try {
        const res = await apiClient.post<Message>(`/api/conversations/${selectedConversation.id}/messages/`, {
          content,
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      } catch (err) {
        console.error('Failed to post message:', err);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden -mx-8 -my-8 sm:mx-0 sm:my-0 sm:h-[calc(100vh-8rem)] sm:rounded-xl sm:border sm:border-border sm:shadow-sm">
      <div className={`w-full sm:w-80 md:w-96 flex-shrink-0 ${selectedConvId ? 'hidden sm:block' : 'block'}`}>
        <ConversationList 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={(id) => setSelectedConvId(id)}
        />
      </div>

      <div className={`flex-1 min-w-0 ${!selectedConvId ? 'hidden sm:flex' : 'flex'}`}>
        <ChatWindow 
          conversation={selectedConversation}
          messages={messages}
          currentUserId={user?.id || 0}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
