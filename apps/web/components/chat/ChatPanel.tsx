'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sendChatMessage } from '@/lib/chat-api';
import type { ChatTurn } from './types';
import { HiX, HiPaperAirplane } from 'react-icons/hi';
import { LuSparkles, LuUser } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SUGGESTIONS = [
  'What experience does Shifaul have with Next.js?',
  'Tell me about the CalQuick project.',
  'What are his strongest backend skills?',
  'Is he available for new projects?',
];

export function useChatPanel() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [turns, open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      const assistantTurn: ChatTurn = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: '',
        pending: true,
      };
      setTurns((prev) => [...prev, userTurn, assistantTurn]);
      setInput('');
      setLoading(true);

      try {
        const res = await sendChatMessage(trimmed);
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id
              ? { ...t, content: res.answer, sources: res.sources, pending: false }
              : t,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id
              ? {
                  ...t,
                  content: 'Sorry, the assistant is unavailable right now. Please email connect@shifaul.dev.',
                  pending: false,
                  error: message,
                }
              : t,
          ),
        );
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return {
    open,
    setOpen,
    turns,
    input,
    setInput,
    loading,
    scrollerRef,
    inputRef,
    send,
    onKeyDown,
  };
}

export function ChatPanel({
  open,
  setOpen,
  turns,
  input,
  setInput,
  loading,
  scrollerRef,
  inputRef,
  send,
  onKeyDown,
}: ReturnType<typeof useChatPanel>) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-32 right-5 z-50 flex h-[min(640px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl',
            'border border-emerald-500/30 bg-zinc-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl',
          )}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <LuSparkles className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-emerald-200">Ask Shifaul&apos;s AI</p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-500/70">
                  RAG · grounded in resume & portfolio
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-emerald-300 cursor-pointer"
            >
              <HiX className="h-5 w-5" />
            </button>
          </header>

          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-4 py-4 text-sm text-zinc-200"
          >
            {turns.length === 0 ? (
              <EmptyState onSuggestion={send} disabled={loading} />
            ) : (
              <div className="space-y-4">
                {turns.map((turn) => (
                  <Message key={turn.id} turn={turn} />
                ))}
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-emerald-500/20 bg-zinc-950/80 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about projects, skills, availability…"
                rows={1}
                maxLength={1000}
                className={cn(
                  'flex-1 resize-none rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 py-2',
                  'text-sm text-zinc-100 placeholder:text-zinc-500',
                  'focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/30',
                )}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-9 w-9 shrink-0 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
                aria-label="Send"
              >
                <HiPaperAirplane className="h-4 w-4 -rotate-45" />
              </Button>
            </form>
            <p className="mt-2 text-[10px] text-zinc-500">
              Answers are generated from public portfolio content. Always verify critical details via email.
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  onSuggestion,
  disabled,
}: {
  onSuggestion: (s: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-300">
        <LuSparkles className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-100">Ask the assistant anything about Shifaul</p>
        <p className="mt-1 text-xs text-zinc-500">
          Powered by RAG over his resume, projects, and the about page.
        </p>
      </div>
      <div className="w-full space-y-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestion(s)}
            className={cn(
              'block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-xs text-zinc-300',
              'transition hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-200 cursor-pointer',
              'disabled:opacity-50 disabled:hover:border-zinc-800',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === 'user';
  return (
    <div className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <span
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full',
          isUser ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-500/15 text-emerald-300',
        )}
        aria-hidden="true"
      >
        {isUser ? <LuUser className="h-4 w-4" /> : <LuSparkles className="h-3.5 w-3.5" />}
      </span>
      <div className={cn('flex max-w-[80%] flex-col gap-1.5', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-emerald-500 text-zinc-950'
              : 'border border-emerald-500/20 bg-zinc-900/70 text-zinc-100',
          )}
        >
          {turn.pending ? (
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300" />
            </span>
          ) : (
            <ChatMarkdown content={turn.content} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tiny markdown renderer for chat responses.
 * Handles: **bold**, *italic*, `code`, [text](url), # headings, - lists, 1. ordered lists.
 * Safe by construction — escapes HTML before applying its own formatting.
 */
function ChatMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_a]:text-emerald-300 [&_a]:underline [&_code]:rounded [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_p]:my-0 [&_strong]:font-semibold [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

function renderBlock(block: string, key: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (/^#{1,3}\s+/.test(trimmed)) {
    const level = (trimmed.match(/^#+/) || [''])[0].length;
    const text = trimmed.replace(/^#+\s+/, '');
    const Tag = (`h${Math.min(level, 3)}`) as 'h1' | 'h2' | 'h3';
    return <Tag key={key}>{renderInline(text)}</Tag>;
  }

  if (/^[-*]\s+/.test(trimmed)) {
    const items = trimmed.split(/\n/).filter((l) => /^[-*]\s+/.test(l));
    return (
      <ul key={key}>
        {items.map((line, i) => (
          <li key={i}>{renderInline(line.replace(/^[-*]\s+/, ''))}</li>
        ))}
      </ul>
    );
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    const items = trimmed.split(/\n/).filter((l) => /^\d+\.\s+/.test(l));
    return (
      <ol key={key}>
        {items.map((line, i) => (
          <li key={i}>{renderInline(line.replace(/^\d+\.\s+/, ''))}</li>
        ))}
      </ol>
    );
  }

  // Single line or paragraph — preserve internal line breaks
  return (
    <p key={key} className="whitespace-pre-wrap break-words">
      {renderInline(trimmed)}
    </p>
  );
}

function renderInline(text: string): React.ReactNode[] {
  // Escape HTML first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const nodes: React.ReactNode[] = [];
  let remaining = escaped;
  let key = 0;

  // Process tokens in priority order: links → bold → italic → inline code
  const patterns: { regex: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }[] = [
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => (
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      ),
    },
    {
      regex: /\*\*([^*]+)\*\*/,
      render: (m) => <strong key={key++}>{m[1]}</strong>,
    },
    {
      regex: /`([^`]+)`/,
      render: (m) => <code key={key++}>{m[1]}</code>,
    },
    {
      regex: /(?<!\*)\*([^*\n]+)\*(?!\*)/,
      render: (m) => <em key={key++}>{m[1]}</em>,
    },
  ];

  while (remaining.length > 0) {
    // Find earliest match across all patterns
    let earliest: { idx: number; len: number; node: React.ReactNode } | null = null;
    for (const { regex, render } of patterns) {
      const m = remaining.match(regex);
      if (m && m.index !== undefined && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, node: render(m) };
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    if (earliest.idx > 0) {
      nodes.push(remaining.slice(0, earliest.idx));
    }
    nodes.push(earliest.node);
    remaining = remaining.slice(earliest.idx + earliest.len);
  }

  return nodes;
}
