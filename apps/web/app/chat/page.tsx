'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sendChatMessage } from '@/lib/chat-api';
import type { ChatTurn } from '@/components/chat/types';
import { HiPaperAirplane } from 'react-icons/hi';
import { LuSparkles, LuUser } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What is Shifaul\'s strongest tech stack?',
  'Tell me about the PixlyOne project.',
  'How many years of experience does he have?',
  'What open source libraries has he built?',
  'Is he open for hire?',
  'What AI/ML experience does he have?',
];

export default function ChatPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [turns]);

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
      } catch {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id
              ? {
                  ...t,
                  content:
                    'Sorry, the assistant is unavailable right now. Please email connect@shifaul.dev.',
                  pending: false,
                }
              : t,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-black text-zinc-100">
      <header className="border-b border-emerald-500/20 px-6 py-8 sm:px-12">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <LuSparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-emerald-200">Ask Shifaul&apos;s AI</h1>
            <p className="text-sm text-zinc-500">
              Retrieval-augmented assistant grounded in resume, portfolio and about page.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div
          ref={scrollerRef}
          className="mx-auto h-full max-w-4xl space-y-6 overflow-y-auto px-6 py-8 sm:px-12"
        >
          {turns.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Try one of these — or ask anything you&apos;d like to know about Shifaul&apos;s work.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={loading}
                    className={cn(
                      'rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-left text-sm text-zinc-300',
                      'transition hover:border-emerald-500/40 hover:text-emerald-200 disabled:opacity-50',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            turns.map((turn) => <Turn key={turn.id} turn={turn} />)
          )}
        </div>
      </main>

      <footer className="border-t border-emerald-500/20 bg-zinc-950/80 px-6 py-4 sm:px-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-4xl items-end gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about projects, skills, availability…"
            rows={1}
            maxLength={1000}
            className={cn(
              'flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3',
              'text-sm text-zinc-100 placeholder:text-zinc-500',
              'focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/30',
            )}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40"
          >
            <HiPaperAirplane className="h-5 w-5 -rotate-45" />
          </button>
        </form>
      </footer>
    </div>
  );
}

function Turn({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full',
          isUser ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-500/15 text-emerald-300',
        )}
      >
        {isUser ? <LuUser className="h-4 w-4" /> : <LuSparkles className="h-4 w-4" />}
      </span>
      <div className={cn('flex max-w-[85%] flex-col gap-2', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser ? 'bg-emerald-500 text-zinc-950' : 'border border-emerald-500/20 bg-zinc-900/70 text-zinc-100',
          )}
        >
          {turn.pending ? (
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" />
            </span>
          ) : (
            <ChatMarkdown content={turn.content} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
  return (
    <p key={key} className="whitespace-pre-wrap break-words">
      {renderInline(trimmed)}
    </p>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const nodes: React.ReactNode[] = [];
  let remaining = escaped;
  let key = 0;
  const patterns: { regex: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }[] = [
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (m) => (<a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>) },
    { regex: /\*\*([^*]+)\*\*/, render: (m) => (<strong key={key++}>{m[1]}</strong>) },
    { regex: /`([^`]+)`/, render: (m) => (<code key={key++}>{m[1]}</code>) },
    { regex: /(?<!\*)\*([^*\n]+)\*(?!\*)/, render: (m) => (<em key={key++}>{m[1]}</em>) },
  ];
  while (remaining.length > 0) {
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
    if (earliest.idx > 0) nodes.push(remaining.slice(0, earliest.idx));
    nodes.push(earliest.node);
    remaining = remaining.slice(earliest.idx + earliest.len);
  }
  return nodes;
}
