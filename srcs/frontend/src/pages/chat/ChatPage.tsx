import { useState } from 'react';
import { ConversationList, type ChatThread } from '@/features/chat/components/ConversationList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Message } from '@/types/chat';

// Mock Current User
const CURRENT_USER_ID = "1";

// Mock Data
const MOCK_CONVERSATIONS: ChatThread[] = [
  {
    id: "c1",
    type: "Direct",
    name: "Douaa E.",
    created_at: "2025-01-01T00:00:00Z",
    lastMessageSnippet: "I'll push the frontend updates now.",
    lastMessageTime: "10:30 AM",
    unreadCount: 2
  },
  {
    id: "c2",
    type: "Direct",
    name: "Anas K.",
    created_at: "2025-01-02T00:00:00Z",
    lastMessageSnippet: "Can you check the API docs?",
    lastMessageTime: "Yesterday",
    unreadCount: 0
  },
  {
    id: "c3",
    type: "Project",
    name: "Website Redesign (General)",
    project_id: "p1",
    created_at: "2025-01-05T00:00:00Z",
    lastMessageSnippet: "Anoir: Let's meet at 3 PM to discuss.",
    lastMessageTime: "Mon",
    unreadCount: 0
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "c1": [
    { id: "m1", conversation_id: "c1", sender_id: "1", content: "Hey Douaa, how is the chat UI coming along?", sent_at: "2025-01-15T10:00:00Z", updated_at: "2025-01-15T10:00:00Z" },
    { id: "m2", conversation_id: "c1", sender_id: "2", content: "Almost done! I'm just wiring up the components now.", sent_at: "2025-01-15T10:05:00Z", updated_at: "2025-01-15T10:05:00Z" },
    { id: "m3", conversation_id: "c1", sender_id: "2", content: "I'll push the frontend updates now.", sent_at: "2025-01-15T10:30:00Z", updated_at: "2025-01-15T10:30:00Z" }
  ],
  "c2": [
    { id: "m4", conversation_id: "c2", sender_id: "3", content: "Can you check the API docs?", sent_at: "2025-01-14T15:00:00Z", updated_at: "2025-01-14T15:00:00Z" }
  ],
  "c3": [
    { id: "m5", conversation_id: "c3", sender_id: "1", content: "Let's meet at 3 PM to discuss.", sent_at: "2025-01-13T09:00:00Z", updated_at: "2025-01-13T09:00:00Z" }
  ]
};

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  
  // Local state for mock messages to allow sending
  const [messagesData, setMessagesData] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [conversationsData, setConversationsData] = useState<ChatThread[]>(MOCK_CONVERSATIONS);

  const selectedConversation = conversationsData.find(c => c.id === selectedConvId) || null;
  const activeMessages = selectedConvId ? (messagesData[selectedConvId] || []) : [];

  const handleSendMessage = (content: string) => {
    if (!selectedConvId) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      conversation_id: selectedConvId,
      sender_id: CURRENT_USER_ID,
      content,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update messages
    setMessagesData(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMessage]
    }));

    // Update conversation snippet and time
    setConversationsData(prev => prev.map(conv => {
      if (conv.id === selectedConvId) {
        return {
          ...conv,
          lastMessageSnippet: content,
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return conv;
    }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden -mx-8 -my-8 sm:mx-0 sm:my-0 sm:h-[calc(100vh-8rem)] sm:rounded-xl sm:border sm:border-border sm:shadow-sm">
      
      {/* Left Sidebar: Conversation List */}
      <div className={`w-full sm:w-80 md:w-96 flex-shrink-0 ${selectedConvId ? 'hidden sm:block' : 'block'}`}>
        <ConversationList 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          conversations={conversationsData}
          selectedId={selectedConvId}
          onSelect={setSelectedConvId}
        />
      </div>

      {/* Main Area: Chat Window */}
      <div className={`flex-1 min-w-0 ${!selectedConvId ? 'hidden sm:flex' : 'flex'}`}>
        <ChatWindow 
          conversation={selectedConversation}
          messages={activeMessages}
          currentUserId={CURRENT_USER_ID}
          onSendMessage={handleSendMessage}
        />
      </div>

    </div>
  );
}
