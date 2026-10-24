import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LlmService } from './llm.service';
import { RetrievedChunk } from './interfaces/llm.interface';

/**
 * Vector store backed by Postgres (no pgvector extension needed).
 * Embeddings stored as Float[] and ranked in-memory via cosine similarity.
 * Fine for the corpus sizes this portfolio bot will see (a few hundred chunks).
 */
@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly llm: LlmService,
  ) {}

  async upsert(input: {
    source: string;
    content: string;
    sourceUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; chunks: number }> {
    const chunks = this.splitText(input.content);
    this.logger.log(
      `Embedding ${chunks.length} chunks for source "${input.source}"`,
    );

    const embeddings = await this.llm.embedBatch(chunks);

    const created = await this.prisma.$transaction(
      chunks.map((text, i) =>
        this.prisma.knowledgeChunk.create({
          data: {
            source: input.source,
            sourceUrl: input.sourceUrl ?? null,
            content: text,
            metadata: input.metadata ?? {},
            embedding: embeddings[i],
          },
          select: { id: true },
        }),
      ),
    );

    return { id: created[0]?.id ?? '', chunks: created.length };
  }

  async deleteBySource(source: string): Promise<number> {
    const result = await this.prisma.knowledgeChunk.deleteMany({
      where: { source },
    });
    return result.count;
  }

  async search(query: string, topK = 5, minScore = 0.35): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.llm.embed(query);

    const all = await this.prisma.knowledgeChunk.findMany({
      select: {
        id: true,
        content: true,
        source: true,
        sourceUrl: true,
        metadata: true,
        embedding: true,
      },
    });

    if (all.length === 0) return [];

    const scored = all
      .map((chunk) => ({
        ...chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((c) => c.embedding && c.embedding.length > 0 && c.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((c) => ({
      id: c.id,
      content: c.content,
      source: c.source,
      sourceUrl: c.sourceUrl,
      metadata: c.metadata,
      score: c.score,
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Split text into overlapping chunks that fit comfortably in an embedding context.
   * Targets ~500 char chunks with 80 char overlap — works well for biographical/
   * project content where context spans a few paragraphs.
   */
  private splitText(text: string): string[] {
    const chunkSize = 500;
    const overlap = 80;
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleaned.length <= chunkSize) return [cleaned];

    if (cleaned.length === 0) return [];

    const chunks: string[] = [];
    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(start + chunkSize, cleaned.length);
      const slice = cleaned.slice(start, end);
      // Prefer cutting on a paragraph or sentence boundary
      const lastBreak = Math.max(
        slice.lastIndexOf('\n\n'),
        slice.lastIndexOf('. '),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('! '),
      );
      const cut =
        lastBreak > chunkSize * 0.5 && end < cleaned.length
          ? lastBreak + 1
          : chunkSize;
      const piece = cleaned.slice(start, start + cut).trim();
      if (piece.length > 0) chunks.push(piece);
      if (start + cut >= cleaned.length) break;
      start = start + cut - overlap;
    }
    return chunks;
  }
}
