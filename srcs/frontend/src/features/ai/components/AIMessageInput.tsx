import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useAIStore } from '@/stores/aiStore';
import { cn } from '@/utils/cn';

export function AIMessageInput() {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sendMessage = useAIStore((state) => state.sendMessage);
  const isTyping = useAIStore((state) => state.isTyping);

  const selectedProjectId = useAIStore((state) => state.selectedProjectId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isTyping) return;
    
    sendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative mt-auto pt-4 bg-background border-t border-border">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 bg-muted/20 border border-border rounded-xl focus-within:ring-1 focus-within:ring-secondary/50 focus-within:border-secondary transition-all shadow-sm overflow-hidden">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedProjectId 
                ? "Ask about tasks, members, or documents in this project..." 
                : "Ask AI anything (code, debugging, concepts)..."
            }
            className="w-full max-h-[200px] min-h-[52px] bg-transparent resize-none py-3.5 pl-4 pr-12 focus:outline-none text-sm leading-relaxed"
            rows={1}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!content.trim() || isTyping}
            className={cn(
              "absolute right-2 bottom-2 p-1.5 rounded-lg flex items-center justify-center transition-all",
              content.trim() && !isTyping 
                ? "bg-secondary text-white hover:bg-secondary/90 shadow-sm" 
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            {isTyping ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
      
      <div className="flex items-center justify-between px-2 mt-2">
        <div className="flex gap-2">
          {selectedProjectId ? (
            <>
              <button 
                type="button" 
                onClick={() => setContent("What are the pending tasks for this project?")}
                className="text-[10px] font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded-full transition-colors"
              >
                Pending tasks
              </button>
              <button 
                type="button" 
                onClick={() => setContent("Summarize the project members and documents")}
                className="text-[10px] font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded-full transition-colors hidden sm:block"
              >
                Team & docs
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => setContent("Explain REST vs WebSocket architecture")}
                className="text-[10px] font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded-full transition-colors"
              >
                REST vs WebSockets
              </button>
              <button 
                type="button" 
                onClick={() => setContent("How do microservices communicate securely?")}
                className="text-[10px] font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded-full transition-colors hidden sm:block"
              >
                Microservices security
              </button>
            </>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 hidden sm:flex">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[9px] font-sans">Enter</kbd> to send
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[9px] font-sans ml-1">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[9px] font-sans">Enter</kbd> for newline
        </div>
      </div>
    </div>
  );
}
