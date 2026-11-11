import { useState, useEffect, useRef } from 'react';
import { ConversationList } from '@/features/chat/components/ConversationList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Message, Conversation, ChatThread } from '@/types/chat';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api/client';
import { createProjectWebSocket, ProjectWebSocketClient } from '@/services/websocket/client';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ChatThread[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const wsRef = useRef<ProjectWebSocketClient | null>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || null;

  const pushMessage = (msg: Message) => {
    setMessages((prev) => (msg.id && prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    setConversations((prev) =>
      prev.map((c) => {
        const convId = msg.conversation || msg.conversation_id;
        if (convId && c.id === convId) {
          return {
            ...c,
            lastMessageSnippet: msg.content,
            lastMessageTime: new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }
        return c;
      })
    );
  };

  // 1. Load active conversations
  useEffect(() => {
    let isMounted = true;
    apiClient.get<Conversation[]>('/api/conversations/my/').then(async (res) => {
      const threads: ChatThread[] = await Promise.all(
        res.data.map(async (c) => {
          let lastMessageSnippet = c.last_message;
          let lastMessageTime: string | undefined;

          try {
            const msgRes = await apiClient.get<Message[]>(`/api/conversations/${c.id}/messages/`);
            const lastMsg = msgRes.data.at(-1);
            if (lastMsg) {
              lastMessageSnippet = lastMsg.content;
              lastMessageTime = new Date(lastMsg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
            }
          } catch {
            // Silently keep lastMessageSnippet empty if history is unavailable
          }

          return {
            ...c,
            name: c.project_name ? `${c.project_name} Chat` : `Project #${c.project_id} Chat`,
            lastMessageSnippet,
            lastMessageTime,
          };
        })
      );

      if (isMounted) {
        setConversations(threads);
        if (threads.length > 0) setSelectedConvId(threads[0].id);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load messages & manage WebSocket for active conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    apiClient.get<Message[]>(`/api/conversations/${selectedConversation.id}/messages/`)
      .then((res) => isMounted && setMessages(res.data))
      .catch(() => {});

    const ws = createProjectWebSocket(selectedConversation.project_id, (msg) => {
      if (isMounted) pushMessage(msg);
    });
    wsRef.current = ws;

    return () => {
      isMounted = false;
      ws.disconnect();
    };
  }, [selectedConversation?.id, selectedConversation?.project_id]);

  // 3. Send message (WS with REST fallback)
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user?.id) return;
    try {
      wsRef.current?.sendMessage(content);
    } catch {
      const res = await apiClient.post<Message>(`/api/conversations/${selectedConversation.id}/messages/`, { content });
      pushMessage(res.data);
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
          onSelect={setSelectedConvId}
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
