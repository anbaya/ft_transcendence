import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Parse markdown into blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed text-sm ${className}`}>
      {blocks.map((block, idx) => (
        <RenderBlock key={idx} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: 'code'; language: string; content: string }
  | { type: 'header'; level: number; content: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'blockquote'; content: string }
  | { type: 'paragraph'; content: string };

function parseMarkdownBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let currentList: { items: string[]; ordered: boolean } | null = null;
  let inCodeBlock = false;
  let codeLang = '';
  let codeContent: string[] = [];

  const flushList = () => {
    if (currentList) {
      blocks.push({
        type: 'list',
        items: currentList.items,
        ordered: currentList.ordered,
      });
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          language: codeLang,
          content: codeContent.join('\n'),
        });
        inCodeBlock = false;
        codeLang = '';
        codeContent = [];
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Empty line ends lists
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList();
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        content: headerMatch[2],
      });
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      flushList();
      blocks.push({
        type: 'blockquote',
        content: line.replace(/^>\s*/, ''),
      });
      continue;
    }

    // Unordered list: - or *
    const unorderedMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (unorderedMatch) {
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { items: [], ordered: false };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    // Ordered list: 1. 2. etc.
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { items: [], ordered: true };
      }
      currentList.items.push(orderedMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push({
      type: 'paragraph',
      content: line,
    });
  }

  if (inCodeBlock) {
    blocks.push({
      type: 'code',
      language: codeLang,
      content: codeContent.join('\n'),
    });
  }
  flushList();

  return blocks;
}

function RenderBlock({ block }: { block: Block }) {
  if (block.type === 'code') {
    return <CodeBlock language={block.language} content={block.content} />;
  }

  if (block.type === 'header') {
    if (block.level === 1) {
      return <h1 className="text-xl font-bold tracking-tight text-foreground mt-4 mb-2">{renderInline(block.content)}</h1>;
    }
    if (block.level === 2) {
      return <h2 className="text-lg font-bold tracking-tight text-foreground mt-3 mb-1.5">{renderInline(block.content)}</h2>;
    }
    return <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{renderInline(block.content)}</h3>;
  }

  if (block.type === 'list') {
    if (block.ordered) {
      return (
        <ol className="list-decimal list-inside space-y-1 my-2 pl-2">
          {block.items.map((item, idx) => (
            <li key={idx} className="text-foreground/90 leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <ul className="list-disc list-inside space-y-1 my-2 pl-2">
        {block.items.map((item, idx) => (
          <li key={idx} className="text-foreground/90 leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'blockquote') {
    return (
      <blockquote className="border-l-4 border-primary/40 pl-3 py-1 my-2 italic text-muted-foreground bg-muted/20 rounded-r">
        {renderInline(block.content)}
      </blockquote>
    );
  }

  return (
    <p className="leading-relaxed text-foreground/90">
      {renderInline(block.content)}
    </p>
  );
}

function CodeBlock({ language, content }: { language: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border/80 bg-slate-900 text-slate-100 my-3 shadow-sm font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-slate-400">
        <span className="font-sans font-medium uppercase text-[10px] tracking-wider text-slate-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
          type="button"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed text-slate-200">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Simple regex-based inline tokenization for `code`, **bold**, *italic*
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check for inline code `...`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Check for bold **...**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Check for italic *...*
    const italicMatch = remaining.match(/\*([^*]+)\*/);

    let earliestMatch: { match: RegExpMatchArray; type: 'code' | 'bold' | 'italic'; index: number } | null = null;

    if (codeMatch && codeMatch.index !== undefined) {
      earliestMatch = { match: codeMatch, type: 'code', index: codeMatch.index };
    }
    if (boldMatch && boldMatch.index !== undefined && (!earliestMatch || boldMatch.index < earliestMatch.index)) {
      earliestMatch = { match: boldMatch, type: 'bold', index: boldMatch.index };
    }
    if (italicMatch && italicMatch.index !== undefined && (!earliestMatch || italicMatch.index < earliestMatch.index)) {
      earliestMatch = { match: italicMatch, type: 'italic', index: italicMatch.index };
    }

    if (!earliestMatch) {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    if (earliestMatch.index > 0) {
      parts.push(<span key={keyIdx++}>{remaining.slice(0, earliestMatch.index)}</span>);
    }

    const matchedText = earliestMatch.match[1];
    if (earliestMatch.type === 'code') {
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[13px] border border-border/50">
          {matchedText}
        </code>
      );
    } else if (earliestMatch.type === 'bold') {
      parts.push(<strong key={keyIdx++} className="font-semibold text-foreground">{matchedText}</strong>);
    } else if (earliestMatch.type === 'italic') {
      parts.push(<em key={keyIdx++} className="italic">{matchedText}</em>);
    }

    remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
  }

  return <>{parts}</>;
}
