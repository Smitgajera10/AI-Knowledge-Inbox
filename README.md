# AI Knowledge Inbox

AI Knowledge Inbox is a small, single-user knowledge workspace for saving notes and webpages, indexing them asynchronously, and asking grounded questions over the saved content.

## Features

- Save plain-text notes or public HTTP(S) URLs.
- Fetch and extract webpage text server-side.
- Process content asynchronously with a bounded in-process queue.
- Chunk content and generate embeddings with OpenAI or Gemini.
- Store items, chunks, and JSON vectors in SQLite.
- Retrieve top matching chunks with cosine similarity.
- Generate RAG answers with validated source citations.
- Browse ingestion status and source snippets in a responsive React UI.

## Architecture

```text
React/Vite client
       │ Fetch API
       ▼
Express API ── Pino logging / Helmet / CORS / Zod
       │
       ├── Items + ingestion routes
       ├── Query + RAG routes
       └── In-process ingestion queue
              │
              ├── URL extraction + SSRF checks
              ├── Chunking
              ├── Embedding provider adapter
              └── SQLite repositories
```

See [`docs/architecture.md`](docs/architecture.md) for the module boundaries and request flows.

## Technology

- Node.js 22+ and TypeScript
- Express, Zod, Helmet, CORS, Pino, Pino HTTP
- SQLite through `better-sqlite3`
- Cheerio for HTML extraction
- Official OpenAI JavaScript SDK and Google Gen AI JavaScript SDK
- React, Vite, React Markdown, Lucide React
- Vitest and Supertest

## Setup

```powershell
npm install
Copy-Item server\.env.example server\.env
```

Edit `server/.env` and set the provider credentials and model IDs supported by the provider accounts you are using. The embedding provider and embedding model must remain the same for ingestion and queries.

Example configuration shape:

```dotenv
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/knowledge-inbox.db
EMBEDDING_PROVIDER=openai
LLM_PROVIDER=gemini
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=
OPENAI_CHAT_MODEL=
GEMINI_API_KEY=
GEMINI_EMBEDDING_MODEL=
GEMINI_CHAT_MODEL=
TOP_K=5
SIMILARITY_THRESHOLD=0.25
```

No API key is used by the client or written to logs.

## Run locally

In separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`. The API health check is available at `http://localhost:3000/api/health`.

## API

### `POST /api/ingest`

Note:

```json
{
  "type": "NOTE",
  "title": "Redis notes",
  "content": "Redis is an in-memory data store."
}
```

URL:

```json
{
  "type": "URL",
  "url": "https://example.com/article"
}
```

Returns `202` immediately:

```json
{
  "success": true,
  "data": {
    "itemId": "generated-id",
    "status": "PENDING"
  }
}
```

### `GET /api/items`

Supports `page`, `limit`, `status`, and `sourceType` query parameters.

### `GET /api/items/:id`

Returns item metadata, source information, raw content, and ingestion status.

### `POST /api/query`

```json
{
  "question": "What is Redis used for?"
}
```

Returns an answer and retrieved source snippets. If no chunks meet the relevance threshold, the API returns an explicit no-answer response without calling the LLM.

### `GET /api/health`

Returns the API health response.

## RAG pipeline

1. A note or URL is stored as `PENDING`.
2. The in-process worker fetches URL content when needed.
3. Content is normalized and split into approximately 500-token chunks with approximately 75-token overlap. The current implementation uses a documented character approximation to avoid an unnecessary tokenizer dependency.
4. The configured embedding adapter returns vectors. Provider, model, and dimensions are stored with every vector.
5. A question is embedded using the same configured embedding provider/model.
6. SQLite vectors are scanned in memory and ranked with cosine similarity.
7. Top-K chunks above the configured threshold become the prompt context.
8. The LLM is instructed to answer only from the context and cite `[source:<chunk-id>]`.
9. Citation IDs are validated against the retrieved chunks before the response is returned.

## Security and reliability

- URL ingestion permits only HTTP(S).
- Localhost, private, link-local, reserved, and credential-bearing URLs are rejected.
- Every redirect is validated.
- Response size, content type, redirect count, and request time are bounded.
- JSON request sizes are capped.
- Errors use a consistent response envelope and safe public messages.
- Detailed failures are logged without API credentials or full document bodies.
- Queued work has bounded retries and backoff.

## Testing

```powershell
npm test
npm run build
```

Tests cover health, validation, asynchronous note ingestion, chunking, cosine similarity, citation validation, query retrieval, empty-context behavior, and mocked AI providers. Paid AI APIs are not called by automated tests.

## Tradeoffs and known limitations

This is intentionally an interview-sized prototype:

- SQLite and JSON vectors are easy to run locally but brute-force search will not scale to large collections.
- The in-process queue is not durable; jobs waiting during a server restart are lost.
- It is single-user and has no authentication or access control.
- Character-based chunk sizing approximates tokens and can be improved with a tokenizer.
- HTML extraction is intentionally simple and cannot replace a full document extraction pipeline.
- External AI calls need provider credentials, rate-limit handling, cost controls, and observability in production.

Production evolution could use PostgreSQL with pgvector, BullMQ with Redis, durable job monitoring, authentication, hybrid retrieval, reranking, stronger extraction, caching, and cost tracking.
