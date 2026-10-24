/**
 * Seed script — run once after migration to load the knowledge base.
 *
 * Usage:
 *   bunx tsx src/ai-assistant/ingestion/seed.ts
 *
 * Requires:
 *   - Migration applied (KnowledgeChunk table exists)
 *   - OPENAI_API_KEY / NVIDIA NIM credentials in .env
 *
 * Writes directly to Postgres via Prisma, bypassing the HTTP layer.
 * Run again to refresh — existing chunks for each source are deleted first.
 */
import { config as loadEnv } from 'dotenv';
import { readFile } from 'fs/promises';
import { join } from 'path';
import OpenAI from 'openai';

loadEnv();

const BASE_URL = process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const EMBED_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'nvidia/nemotron-3-embed-1b';
const API_KEY = process.env.OPENAI_API_KEY || '';

if (!API_KEY) {
  console.error('Set OPENAI_API_KEY in your .env');
  process.exit(1);
}

// Prisma client (mirror backend setup)
const { PrismaClient } = require('../../../prisma/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const openai = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 80;

interface Source {
  source: string;
  sourceUrl?: string;
  content: string;
  metadata?: Record<string, any>;
}

function splitText(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (cleaned.length === 0) return [];
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];
  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const slice = cleaned.slice(start, end);
    const lastBreak = Math.max(
      slice.lastIndexOf('\n\n'),
      slice.lastIndexOf('. '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('! '),
    );
    const cut = lastBreak > CHUNK_SIZE * 0.5 && end < cleaned.length ? lastBreak + 1 : CHUNK_SIZE;
    const piece = cleaned.slice(start, start + cut).trim();
    if (piece.length > 0) chunks.push(piece);
    if (start + cut >= cleaned.length) break;
    start = start + cut - CHUNK_OVERLAP;
  }
  return chunks;
}

async function loadSources(): Promise<Source[]> {
  const base = __dirname;
  return [
    { source: 'resume', sourceUrl: 'https://shifaul.dev', content: await readFile(join(base, 'resume.txt'), 'utf-8'), metadata: { type: 'resume', version: '2026' } },
    { source: 'about', sourceUrl: 'https://shifaul.dev/about', content: await readFile(join(base, 'about.txt'), 'utf-8'), metadata: { type: 'about' } },
    { source: 'portfolio', sourceUrl: 'https://shifaul.dev/portfolio', content: await readFile(join(base, 'portfolio.txt'), 'utf-8'), metadata: { type: 'portfolio' } },
    { source: 'contact', sourceUrl: 'https://shifaul.dev/contact', content: await readFile(join(base, 'contact.txt'), 'utf-8'), metadata: { type: 'contact' } },
    { source: 'preferences', sourceUrl: 'https://shifaul.dev', content: await readFile(join(base, 'preferences.txt'), 'utf-8'), metadata: { type: 'preferences' } },
  ];
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: texts.map((t) => t.replace(/\s+/g, ' ').trim().slice(0, 8000)),
  });
  return res.data.map((d) => d.embedding as unknown as number[]);
}

async function ingest(source: Source): Promise<number> {
  const chunks = splitText(source.content);
  console.log(`▶ ${source.source}: ${chunks.length} chunks, embedding…`);

  // Wipe existing chunks for this source first
  const deleted = await prisma.knowledgeChunk.deleteMany({ where: { source: source.source } });
  if (deleted.count > 0) {
    console.log(`  · removed ${deleted.count} old chunks`);
  }

  let inserted = 0;
  const BATCH = 16;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embeddings = await embedBatch(batch);
    await prisma.knowledgeChunk.createMany({
      data: batch.map((text, j) => ({
        source: source.source,
        sourceUrl: source.sourceUrl ?? null,
        content: text,
        metadata: source.metadata ?? {},
        embedding: embeddings[j],
      })),
    });
    inserted += batch.length;
    process.stdout.write(`  · ${inserted}/${chunks.length}\r`);
  }
  console.log(`  ✓ ${source.source}: ${inserted} chunks inserted`);
  return inserted;
}

async function main(): Promise<void> {
  console.log(`Embedding model: ${EMBED_MODEL}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const sources = await loadSources();
  let total = 0;
  for (const source of sources) {
    try {
      total += await ingest(source);
    } catch (e) {
      console.error(`✗ ${source.source}:`, (e as Error).message);
    }
  }

  console.log(`\n✓ Done. Inserted ${total} chunks across ${sources.length} sources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
