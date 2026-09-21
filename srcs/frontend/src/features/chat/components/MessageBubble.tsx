import { Avatar } from '@/components/ui/Avatar';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
  senderAvatarUrl?: string;
  showAvatar?: boolean;
}

export function MessageBubble({ 
  message, 
  isCurrentUser, 
  senderName, 
  senderAvatarUrl,
  showAvatar = true
}: MessageBubbleProps) {
  
  const formattedTime = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] sm:max-w-[65%] gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Area */}
        {showAvatar ? (
          <div className="flex-shrink-0 mt-auto">
            <Avatar 
              src={senderAvatarUrl} 
              fallback={senderName.substring(0, 2).toUpperCase()} 
              size="sm" 
            />
          </div>
        ) : (
          <div className="w-8 flex-shrink-0" /> // Spacer for alignment if avatar is hidden (consecutive messages)
        )}

        {/* Bubble */}
        <div className="flex flex-col">
          {!isCurrentUser && showAvatar && (
            <span className="text-xs text-muted ml-1 mb-1 font-medium">{senderName}</span>
          )}
          
          <div 
            className={`px-4 py-2.5 rounded-2xl ${
              isCurrentUser 
                ? 'bg-secondary text-white rounded-br-sm' 
                : 'bg-slate-100 text-primary border border-slate-200 rounded-bl-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          
          <span className={`text-[10px] text-muted mt-1 ${isCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
            {formattedTime}
          </span>
        </div>

      </div>
    </div>
  );
}
