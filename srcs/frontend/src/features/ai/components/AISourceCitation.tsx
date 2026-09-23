import React from 'react';
import { FileText } from 'lucide-react';
import type { RAGSource } from '@/types/ai';

interface AISourceCitationProps {
  sources: RAGSource[];
}

export function AISourceCitation({ sources }: AISourceCitationProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Sources
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div 
            key={index}
            className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
            title={source.snippet}
          >
            <FileText className="w-3.5 h-3.5 text-secondary" />
            <span className="font-medium truncate max-w-[150px]">
              {source.filename}
            </span>
            {source.page_number && (
              <span className="opacity-70 border-l border-border pl-1.5 ml-0.5">
                p. {source.page_number}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
