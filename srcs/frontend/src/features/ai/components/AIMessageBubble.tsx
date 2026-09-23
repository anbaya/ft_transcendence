import React from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { AISourceCitation } from './AISourceCitation';
import type { AIMessage } from '@/types/ai';
import { cn } from '@/utils/cn';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export function AIMessageBubble({ message }: AIMessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 flex items-start">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            isUser ? "bg-secondary" : "bg-primary"
          )}>
            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex flex-col group relative",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "px-4 py-3 text-sm rounded-2xl whitespace-pre-wrap",
            isUser 
              ? "bg-secondary text-white rounded-tr-sm" 
              : "bg-muted/30 text-foreground border border-border/50 rounded-tl-sm shadow-sm"
          )}>
            {message.content}
            {!isUser && message.sources && (
              <AISourceCitation sources={message.sources} />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {!isUser && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground rounded"
                title="Copy message"
              >
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
