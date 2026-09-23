import React from 'react';
import { AIChat } from '@/features/ai/components/AIChat';

export default function AIAssistantPage() {
  return (
    <div className="flex-1 h-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="h-[calc(100vh-6rem)]">
        <AIChat isFullScreen={true} />
      </div>
    </div>
  );
}
