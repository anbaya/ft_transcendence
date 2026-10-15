import { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Trash2, Bot, FolderGit2, Globe, Sparkles } from 'lucide-react';
import { useAIStore } from '@/stores/aiStore';
import { useProjectStore } from '@/stores/projectStore';
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
    messages,
    selectedProjectId,
    setSelectedProjectId,
    fetchHistory,
    clearHistory,
    isTyping, 
    isLoading,
    error,
    clearError
  } = useAIStore();

  const { projects, fetchProjects } = useProjectStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
    fetchHistory(selectedProjectId);
  }, [selectedProjectId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const handleClearHistory = () => {
    const contextLabel = activeProject ? `project "${activeProject.name}"` : 'General Mode';
    if (window.confirm(`Clear chat history for ${contextLabel}?`)) {
      clearHistory(selectedProjectId);
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-background/95 backdrop-blur-sm border-border shadow-2xl transition-all duration-300 ease-in-out",
      isFullScreen 
        ? "w-full h-full rounded-xl border" 
        : "w-[420px] h-[calc(100vh-2rem)] rounded-l-2xl border-l border-y"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">AI Assistant</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                {activeProject ? 'Project RAG' : 'General'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeProject ? activeProject.name : 'Ask anything technical or project-related'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
          {/* Quick context selector for compact mode */}
          {!isFullScreen && (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              className="text-xs bg-muted/60 border border-border rounded-lg px-2 py-1 max-w-[130px] truncate text-foreground focus:outline-none"
            >
              <option value="">🌐 General</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          )}

          {messages.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="p-1.5 rounded-md hover:bg-error/10 hover:text-error transition-colors"
              title="Clear History"
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
        
        {/* Sidebar History & Project Selection (Only in full screen) */}
        {isFullScreen && (
          <div className="w-64 border-r border-border bg-muted/10 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assistant Mode
                </div>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
                    selectedProjectId === null 
                      ? "bg-secondary text-white font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <div className="truncate">
                    <div>General Mode</div>
                    <div className="text-[10px] opacity-80">Direct knowledge</div>
                  </div>
                </button>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Project Context (RAG)
                </div>
                <div className="space-y-1">
                  {projects.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-1">No projects available.</p>
                  ) : (
                    projects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => setSelectedProjectId(Number(proj.id))}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
                          selectedProjectId === Number(proj.id)
                            ? "bg-secondary text-white font-medium shadow-sm" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <FolderGit2 className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1 truncate">
                          <div className="truncate">{proj.name}</div>
                          <div className="text-[10px] opacity-80 capitalize truncate">{proj.status.replace('_', ' ')}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Sparkles className="w-4 h-4 animate-spin text-secondary" />
                  <span>Loading conversations...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-75">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {activeProject ? `Ask about "${activeProject.name}"` : 'How can I assist you today?'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {activeProject 
                    ? 'I can answer questions regarding tasks, team members, deadlines, and indexed documents for this project.'
                    : 'I can assist you with programming, architecture design, general questions, and technical troubleshooting.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 pb-4">
                {messages.map(msg => (
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
