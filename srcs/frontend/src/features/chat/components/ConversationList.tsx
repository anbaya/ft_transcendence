import { Search, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Conversation } from '@/types/chat';

// Extended conversation model with UI-specific properties
export interface ChatThread extends Conversation {
  name: string;
  avatarUrl?: string;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  conversations: ChatThread[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
}

export function ConversationList({ 
  searchQuery, 
  onSearchChange, 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  
  // Filter conversations based on the search query
  const filtered = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-border bg-white">
      {/* Header & Search */}
      <div className="flex-none p-4 border-b border-border">
        <h2 className="text-xl font-bold text-primary mb-4">Messages</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-slate-50 pl-10 pr-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted h-full">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          /* Render the filtered list of conversations */
          <ul className="divide-y divide-border">
            {filtered.map(conv => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                    String(selectedId) === String(conv.id) ? 'bg-slate-50 border-l-2 border-primary' : 'border-l-2 border-transparent'
                  }`}
                >
                  <Avatar 
                    src={conv.avatarUrl} 
                    fallback={conv.name.substring(0, 2).toUpperCase()} 
                    size="md" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm truncate ${selectedId === conv.id ? 'font-semibold text-primary' : 'font-medium text-primary'}`}>
                        {conv.name}
                      </h3>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-muted whitespace-nowrap ml-2">
                          {conv.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unreadCount ? 'font-medium text-primary' : 'text-muted'}`}>
                        {conv.lastMessageSnippet || 'No messages yet'}
                      </p>
                      {conv.unreadCount ? (
                        <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full bg-secondary text-[10px] font-medium text-white">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
