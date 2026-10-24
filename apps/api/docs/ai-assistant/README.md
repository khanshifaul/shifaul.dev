# Shifaul.dev — AI Assistant (RAG)

A Retrieval-Augmented Generation chatbot that answers visitor questions about
Shifaul Islam's work, grounded in his resume, about page, and portfolio.

Built as a drop-in module for the existing `backend.shifaul.dev` (NestJS) and
`frontend.shifaul.dev` (Next.js) repos.

## What's in here

```
shifaul-rag/
├── backend/
│   ├── prisma-schema-additions.prisma   # append to schema.prisma
│   ├── env-additions.txt                # append to .env
│   └── src/ai-assistant/
│       ├── ai-assistant.controller.ts
│       ├── ai-assistant.module.ts
│       ├── ai-assistant.service.ts
│       ├── llm.service.ts
│       ├── vector-store.service.ts
│       ├── dto/chat.dto.ts
│       ├── interfaces/llm.interface.ts
│       └── ingestion/
│           ├── seed.ts
│           ├── resume.txt
│           ├── about.txt
│           ├── portfolio.txt
│           └── contact.txt
├── frontend/
│   ├── components/chat/
│   │   ├── ChatWidget.tsx              # floating chat bubble
│   │   └── types.ts
│   ├── lib/chat-api.ts
│   └── app/chat/page.tsx               # full-page chat at /chat
└── docs/
    ├── backend-integration.md
    └── frontend-integration.md
```

## How it works

1. **Knowledge base**: Resume + about + portfolio + contact copy is split
   into ~500-character chunks, embedded with `text-embedding-3-small` (or
   any OpenAI-compatible embedding model), and stored in Postgres as `Float[]`.

2. **Query**: When a visitor asks a question, the question is embedded with
   the same model, and the top-5 most similar chunks are retrieved by
   cosine similarity (computed in JS — no pgvector required).

3. **Generation**: The retrieved chunks are injected into a system prompt
   along with the last few turns of conversation history. The chat model
   (default `gpt-4o-mini`, swappable to Groq/Together/Ollama via
   `OPENAI_BASE_URL`) produces a grounded answer.

4. **Citations**: Each response carries source pills (Resume, About, etc.)
   so visitors can verify the answer.

5. **Persistence**: All Q&A turns are saved to `chat_sessions` /
   `chat_messages` so conversations continue across reloads via a
   `sessionKey` in localStorage.

## Quick start

```bash
# 1. Backend
cd backend.shifaul.dev
bun add openai
# Append prisma-schema-additions.prisma → schema.prisma
# Append env-additions.txt → .env  (set OPENAI_API_KEY)
bunx prisma migrate dev --name add-ai-assistant
# Copy src/ai-assistant/ into src/
# Wire AiAssistantModule into AppModule
bun run start:dev

# 2. Seed
ADMIN_TOKEN=<admin-jwt> bunx tsx src/ai-assistant/ingestion/seed.ts

# 3. Frontend
cd ../frontend.shifaul.dev
# Copy components/chat/, lib/chat-api.ts, app/chat/
# Add <ChatWidget /> to your public layout
bun dev
```

Open `http://localhost:3000/chat` and ask: *"Tell me about the CalQuick project."*

## Endpoints

```
POST /api/ai-assistant/chat              # public, 20 req/min throttle
  body: { message: string, sessionKey?: string }
  → { answer, sources[], sessionKey, tokens }

POST /api/ai-assistant/ingest            # admin only
  body: { source, content, sourceUrl?, metadata? }
  → { id, chunks }

GET  /api/ai-assistant/sources           # admin/staff/developer
  → [{ source, chunks }]

DELETE /api/ai-assistant/sources/:source # admin only
  → { deleted }
```

## Cost estimate (gpt-4o-mini + text-embedding-3-small)

- One-time ingestion: ~30 KB of text → ~80 chunks → ~$0.001
- Per query: ~1500 tokens in, ~300 out → ~$0.0005
- 1000 visitors/day × 3 questions each → ~$1.50/day

You can swap to a cheaper or free model by changing `OPENAI_CHAT_MODEL`:

```
OPENAI_CHAT_MODEL=llama-3.1-8b-instant   # via Groq (free tier)
```

## Why this design

- **No external vector DB**: Stored as `Float[]` in Postgres. Cosine
  similarity computed in JS. Fast enough for the corpus size (a few
  hundred chunks); can move to pgvector or Qdrant if it grows.

- **No Langchain**: Direct OpenAI SDK calls. The code is shorter, more
  debuggable, and free of dependency churn.

- **Provider-agnostic**: Works with any OpenAI-compatible API. Swap
  `OPENAI_BASE_URL` and `OPENAI_CHAT_MODEL` to use Groq, Together,
  Ollama, or LM Studio.

- **Matches existing style**: Backend follows the NestJS module pattern
  used by `projects`, `blog-posts`, etc. Frontend uses the existing
  `cn`, `Button`, and `motion` primitives.

## Limitations

- In-memory cosine similarity. A few hundred chunks is the sweet spot.
  If you grow past a few thousand, switch to pgvector.
- No streaming yet — answers arrive all at once. Add SSE in
  `ai-assistant.controller.ts` if you want token-by-token streaming.
- No auth on chat. Throttled to 20 req/min per IP. Add a captcha if
  you see abuse.
