import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Trigger the send callback if the message is not empty
  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
    }
  };

  // Submit message on Enter (without Shift for newlines)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-white flex items-end gap-2">
      <div className="flex-1 bg-slate-50 border border-border rounded-xl flex items-end focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
        <button 
          className="p-3 text-muted hover:text-primary transition-colors disabled:opacity-50"
          disabled={disabled}
        >
          <Smile className="h-5 w-5" />
        </button>
        
        {/* Auto-resizing message input field */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 max-h-[120px] bg-transparent border-0 py-3 px-1 text-sm text-primary placeholder:text-muted focus:ring-0 resize-none outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={1}
        />
      </div>
      
      <Button 
        onClick={handleSend} 
        disabled={!content.trim() || disabled}
        className="h-11 w-11 rounded-full p-0 flex-shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
