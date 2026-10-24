export interface ChatSource {
  source: string;
  sourceUrl?: string;
  score: number;
  snippet: string;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  pending?: boolean;
  error?: string;
}
