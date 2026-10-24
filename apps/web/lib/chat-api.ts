'use client';

import type { ChatSource } from '@/components/chat/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function sessionKey(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'shifaul-ai-session';
  let v = window.localStorage.getItem(key);
  if (!v) {
    v = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(key, v);
  }
  return v;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  sessionKey: string;
  tokens: number;
  contactRequestId?: string;
  contactRequestStatus?: 'detected' | 'pending' | 'sent' | 'failed' | null;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/ai-assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionKey: sessionKey() }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat failed (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Chat request failed');
  }
  return json.data as ChatResponse;
}
