# Backend integration — drop-in instructions

## 1. Copy module files

Copy `src/ai-assistant/` into your `backend.shifaul.dev/src/` directory:

```
src/ai-assistant/
├── ai-assistant.controller.ts
├── ai-assistant.module.ts
├── ai-assistant.service.ts
├── llm.service.ts
├── vector-store.service.ts
├── dto/
│   └── chat.dto.ts
├── interfaces/
│   └── llm.interface.ts
└── ingestion/
    ├── seed.ts
    ├── resume.txt
    ├── about.txt
    ├── portfolio.txt
    └── contact.txt
```

## 2. Add Prisma models

Append the contents of `prisma-schema-additions.prisma` to your existing
`prisma/schema.prisma`. Then run:

```bash
bunx prisma generate
bunx prisma migrate dev --name add-ai-assistant
```

## 3. Wire the module

In `src/app.module.ts`, add to the `imports` array:

```ts
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

@Module({
  imports: [
    // ...existing imports
    AiAssistantModule,
  ],
})
export class AppModule {}
```

## 4. Install the OpenAI SDK

```bash
bun add openai
```

## 5. Add environment variables

Append the contents of `env-additions.txt` to your `.env`. Set `OPENAI_API_KEY`.

If you want to use a different provider (e.g. Groq for free chat), set:

```
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_CHAT_MODEL=llama-3.1-70b-versatile
OPENAI_API_KEY=<your-groq-key>
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Note: Groq does not currently host embedding models, so embeddings still
need to go to OpenAI (or another embedding-capable provider). If both
share the same client, embeddings will fail on Groq. The simplest fix is
to keep `OPENAI_BASE_URL=https://api.openai.com/v1` and pay OpenAI for
embeddings while using Groq for chat (you can split clients in
`llm.service.ts` if you want both routed independently).

## 6. Verify the endpoints

Start the server and hit:

```
GET  http://localhost:4000/api/ai-assistant/sources       # admin only
POST http://localhost:4000/api/ai-assistant/chat          # public
POST http://localhost:4000/api/ai-assistant/ingest        # admin only
```

`POST /chat` body:

```json
{
  "message": "What experience does Shifaul have with Next.js?",
  "sessionKey": "optional-keep-for-conversation"
}
```

## 7. Seed the knowledge base

Get an admin JWT, then:

```bash
ADMIN_TOKEN=<jwt> bunx tsx src/ai-assistant/ingestion/seed.ts
```

You should see each source ingest successfully. Re-run anytime to refresh.

## 8. (Optional) Auto-ingest on changes

For a production-quality setup, replace the seed script with a webhook
handler on your admin UI that re-embeds a source whenever the resume
or portfolio changes. The `POST /api/ai-assistant/ingest` endpoint is
already idempotent by source — calling it again rewrites all chunks
for that source.

## 9. Verify with curl

```bash
curl -X POST http://localhost:4000/api/ai-assistant/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What projects has Shifaul built?"}'
```

You should get back a JSON envelope with `data.answer` and `data.sources`.
