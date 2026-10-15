import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api/client';
import { createProjectWebSocket, ProjectWebSocketClient } from '@/services/websocket/client';
import type { Message, Conversation } from '@/types/chat';

interface ProjectChatTabProps {
  projectId: string | number;
}

export function ProjectChatTab({ projectId }: ProjectChatTabProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  const wsRef = useRef<ProjectWebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages, then connect WebSocket
  useEffect(() => {
    let isMounted = true;

    const setupChat = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Get or create conversation for project
        const convRes = await apiClient.get<Conversation>(`/api/conversations/projects/${projectId}/`);
        if (!isMounted) return;
        setConversation(convRes.data);

        // 2. Fetch message history
        const msgRes = await apiClient.get<Message[]>(`/api/conversations/${convRes.data.id}/messages/`);
        if (!isMounted) return;
        setMessages(msgRes.data);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load project conversation/messages', err);
        setError(err.response?.data?.detail || 'Failed to load chat history.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    setupChat();

    // 3. Connect per-project WebSocket
    const ws = createProjectWebSocket(
      projectId,
      (incomingMsg) => {
        if (!isMounted) return;
        setMessages((prev) => {
          // Deduplicate by message ID
          if (incomingMsg.id && prev.some((m) => m.id === incomingMsg.id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });
      },
      (status) => {
        if (isMounted) setWsStatus(status);
      }
    );
    wsRef.current = ws;

    return () => {
      isMounted = false;
      ws.disconnect();
    };
  }, [projectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    // Primary: Send via WebSocket
    if (wsRef.current && wsStatus === 'connected') {
      wsRef.current.sendMessage(text);
    } else if (conversation) {
      // Fallback: Send via REST endpoint if WS is temporarily reconnecting
      try {
        const res = await apiClient.post<Message>(`/api/conversations/${conversation.id}/messages/`, {
          content: text,
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      } catch (err: any) {
        console.error('Failed to send message via REST', err);
        setError('Failed to deliver message.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-3" />
        <p className="text-sm">Loading project discussion...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] rounded-lg border border-border bg-white shadow-sm overflow-hidden">
      {/* Chat Tab Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-slate-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-secondary" />
          <h2 className="text-sm font-semibold text-primary">Team Discussion</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-emerald-500'
                : wsStatus === 'connecting'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-muted capitalize">{wsStatus}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 text-xs border-b border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400">Start the conversation with your team members.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender_id) === String(user?.id);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-slate-600">
                    {isMe ? 'You' : msg.sender_name || `Member #${msg.sender_id}`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${
                    isMe
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-slate-50 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message to your team..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-md border border-border bg-white px-3.5 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
        />
        <Button type="submit" disabled={!inputText.trim()}>
          <Send className="h-4 w-4 mr-1.5" />
          Send
        </Button>
      </form>
    </div>
  );
}
