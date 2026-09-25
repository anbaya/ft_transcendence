import { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, MessageSquarePlus, Trash2, Bot } from 'lucide-react';
import { useAIStore } from '@/stores/aiStore';
import { AIMessageBubble } from './AIMessageBubble';
import { AIMessageInput } from './AIMessageInput';
import { AITypingIndicator } from './AITypingIndicator';
import { cn } from '@/utils/cn';

interface AIChatProps {
  isFullScreen?: boolean;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
}

export function AIChat({ isFullScreen = false, onClose, onToggleFullScreen }: AIChatProps) {
  const { 
    conversations, 
    activeConversationId, 
    isTyping, 
    error,
    setActiveConversation,
    createNewConversation,
    deleteConversation,
    clearError
  } = useAIStore();

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  return (
    <div className={cn(
      "flex flex-col bg-background/95 backdrop-blur-sm border-border shadow-2xl transition-all duration-300 ease-in-out",
      isFullScreen 
        ? "w-full h-full rounded-xl border" 
        : "w-[400px] h-[calc(100vh-2rem)] rounded-l-2xl border-l border-y"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Ask me anything</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <button 
            onClick={() => createNewConversation()}
            className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            title="New Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          {activeConversationId && conversations.length > 1 && (
            <button 
              onClick={() => deleteConversation(activeConversationId)}
              className="p-1.5 rounded-md hover:bg-error/10 hover:text-error transition-colors"
              title="Delete Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onToggleFullScreen && (
            <button 
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors hidden sm:block"
              title={isFullScreen ? "Collapse" : "Expand"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && !isFullScreen && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar History (Only visible in full screen) */}
        {isFullScreen && (
          <div className="w-64 border-r border-border bg-muted/10 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </div>
              <div className="space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate",
                      activeConversationId === conv.id 
                        ? "bg-secondary/10 text-secondary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  I can answer questions about your codebase, summarize project requirements, and help you find documents.
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 pb-4">
                {activeConversation.messages.map(msg => (
                  <AIMessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && (
                  <div className="flex w-full justify-start mb-4">
                    <AITypingIndicator />
                  </div>
                )}
                {error && (
                  <div className="flex w-full justify-center my-4">
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <span>{error}</span>
                      <button onClick={clearError} className="underline hover:no-underline font-medium ml-2">Dismiss</button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
              </div>
            )}
          </div>

          <AIMessageInput />
        </div>

      </div>
    </div>
  );
}
