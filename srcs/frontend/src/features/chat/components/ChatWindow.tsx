import { useEffect, useRef } from 'react';
import { MessageSquare, Phone, Video, MoreVertical, Info } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import type { Message } from '@/types/chat';
import type { ChatThread } from './ConversationList';

interface ChatWindowProps {
  conversation: ChatThread | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ 
  conversation, 
  messages, 
  currentUserId,
  onSendMessage 
}: ChatWindowProps) {
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty State
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
        <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Your Messages</h2>
        <p className="text-muted text-center max-w-sm">
          Select a conversation from the sidebar to start chatting, or start a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] relative overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 py-3 border-b border-border bg-white flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar 
            src={conversation.avatarUrl} 
            fallback={conversation.name.substring(0, 2).toUpperCase()} 
            size="md" 
          />
          <div>
            <h2 className="font-semibold text-primary">{conversation.name}</h2>
            <p className="text-xs text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
              Online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-9 w-9 p-0 text-muted hover:text-primary hidden sm:flex">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="h-9 w-9 p-0 text-muted hover:text-primary hidden sm:flex">
            <Video className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
          <Button variant="ghost" className="h-9 w-9 p-0 text-muted hover:text-primary">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="h-9 w-9 p-0 text-muted hover:text-primary">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col">
          {messages.length === 0 ? (
            <div className="text-center text-muted my-auto py-10">
              <p className="text-sm bg-white border border-border inline-block px-4 py-1.5 rounded-full shadow-sm">
                This is the beginning of your conversation with {conversation.name}
              </p>
            </div>
          ) : (
            // Map through messages and render individual bubbles
            messages.map((msg, idx) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              
              // Only show avatar for the last message in a consecutive group from the same sender
              const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].sender_id !== msg.sender_id;
              
              // We'd typically look up the sender's real name based on sender_id.
              // For mock purposes, if it's the current user, it's "You", otherwise it's the conversation partner.
              const senderName = isCurrentUser ? 'You' : conversation.name;
              
              return (
                <MessageBubble 
                  key={msg.id}
                  message={msg}
                  isCurrentUser={isCurrentUser}
                  senderName={senderName}
                  senderAvatarUrl={isCurrentUser ? undefined : conversation.avatarUrl}
                  showAvatar={!isCurrentUser && isLastInGroup}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
