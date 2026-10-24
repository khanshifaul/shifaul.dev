import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingResponse,
} from './interfaces/llm.interface';

/**
 * Thin wrapper over OpenAI SDK with split providers:
 *   - Chat:    OPENAI_BASE_URL + OPENAI_API_KEY (default: Kilo Gateway, Groq, NVIDIA NIM, OpenAI, Together, Ollama, etc.)
 *   - Embed:   OPENAI_EMBEDDING_BASE_URL + OPENAI_EMBEDDING_API_KEY (falls back to chat client if not set)
 *
 * Why split: free tiers often support only one or the other. Kilo free has no
 * embedding models; NVIDIA NIM has free embeddings but flaky chat. So we use Kilo
 * for chat and NVIDIA for embeddings — both free.
 *
 * Both clients work with any OpenAI-compatible endpoint by setting baseURL.
 */
@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  private chatClient: OpenAI;
  private embedClient: OpenAI;
  private embeddingModel: string;
  private chatModel: string;

  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_BASE_MS = 800;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const chatApiKey =
      this.config.get<string>('OPENAI_API_KEY') ||
      this.config.get<string>('LLM_API_KEY');
    const chatBaseURL =
      this.config.get<string>('OPENAI_BASE_URL') ||
      this.config.get<string>('LLM_BASE_URL') ||
      'https://api.openai.com/v1';

    this.embeddingModel =
      this.config.get<string>('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
    this.chatModel =
      this.config.get<string>('OPENAI_CHAT_MODEL') || 'gpt-4o-mini';

    if (!chatApiKey) {
      this.logger.warn('OPENAI_API_KEY not set — chat endpoints will fail.');
    }

    this.chatClient = new OpenAI({
      apiKey: chatApiKey || 'missing-key',
      baseURL: chatBaseURL,
      timeout: 30_000,
      maxRetries: 0,
    });

    // Embedding client: separate baseURL/key if provided, else reuse chat client.
    const embedApiKey =
      this.config.get<string>('OPENAI_EMBEDDING_API_KEY') || chatApiKey;
    const embedBaseURL =
      this.config.get<string>('OPENAI_EMBEDDING_BASE_URL') || chatBaseURL;

    if (embedApiKey !== chatApiKey || embedBaseURL !== chatBaseURL) {
      this.embedClient = new OpenAI({
        apiKey: embedApiKey || 'missing-key',
        baseURL: embedBaseURL,
        timeout: 30_000,
        maxRetries: 0,
      });
      this.logger.log(
        `LLM clients initialised (chat=${chatBaseURL}/${this.chatModel}, embed=${embedBaseURL}/${this.embeddingModel})`,
      );
    } else {
      this.embedClient = this.chatClient;
      this.logger.log(
        `LLM client initialised (base=${chatBaseURL}, chat=${this.chatModel}, embed=${this.embeddingModel})`,
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
    const res = await this.withRetry('embed', () =>
      this.embedClient.embeddings.create({
        model: this.embeddingModel,
        input: cleaned,
      }),
    );
    return (res.data[0] as unknown as EmbeddingResponse).embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await this.withRetry('embedBatch', () =>
      this.embedClient.embeddings.create({
        model: this.embeddingModel,
        input: texts.map((t) => t.replace(/\s+/g, ' ').trim().slice(0, 8000)),
      }),
    );
    return res.data.map((d) => (d as unknown as EmbeddingResponse).embedding);
  }

  async chat(messages: ChatCompletionMessage[], opts: {
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<ChatCompletionResponse> {
    const req: ChatCompletionRequest = {
      model: this.chatModel,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 300,
    };
    const res = await this.withRetry('chat', () =>
      this.chatClient.chat.completions.create(req as any),
    );
    return res as unknown as ChatCompletionResponse;
  }

  /**
   * Retry on transient errors (network, 5xx, 429) with exponential backoff.
   * Does NOT retry on 4xx (client errors like bad request, auth) — those won't fix themselves.
   */
  private async withRetry<T>(op: string, fn: () => Promise<T>): Promise<T> {
    const maxAttempts = LlmService.MAX_RETRIES + 1;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        const status = err?.status ?? err?.response?.status;
        const isRetriable =
          status === undefined ||
          status === 408 ||
          status === 429 ||
          (status >= 500 && status < 600);
        if (!isRetriable || attempt === maxAttempts) {
          this.logger.error(
            `[${op}] attempt ${attempt}/${maxAttempts} failed (status=${status ?? 'n/a'}): ${err?.message ?? err}`,
          );
          throw err;
        }
        const delay = LlmService.RETRY_BASE_MS * 2 ** (attempt - 1);
        this.logger.warn(
          `[${op}] attempt ${attempt}/${maxAttempts} failed (status=${status ?? 'n/a'}), retrying in ${delay}ms`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }
}
