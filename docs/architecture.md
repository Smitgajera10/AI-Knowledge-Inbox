# Architecture

## Module boundaries

The application is split into two independently runnable packages:

- `client/`: React presentation, hooks, typed API calls, forms, item cards, and chat UI.
- `server/`: Express transport, configuration, repositories, ingestion worker, provider adapters, vector search, and RAG orchestration.

Controllers only translate HTTP requests and responses. Services own business rules. Repositories own SQLite access. Provider adapters are the only modules that call OpenAI or Gemini SDKs.

## Ingestion flow

```text
POST /api/ingest
  -> validate NOTE/URL payload
  -> persist PENDING item
  -> enqueue item ID
  -> return 202

worker
  -> mark PROCESSING
  -> safely fetch/extract URL content when required
  -> chunk normalized content
  -> generate embeddings
  -> transactionally replace chunks and embeddings
  -> mark COMPLETED
  -> or mark FAILED with safe error message
```

The queue has bounded concurrency, deduplicates queued item IDs, retries failed jobs with exponential backoff, and logs terminal failures. It is intentionally in-process and non-durable.

## Query flow

```text
POST /api/query
  -> validate question
  -> embed question
  -> load completed vectors from SQLite
  -> reject incompatible provider/model/dimension rows
  -> calculate cosine similarity
  -> apply threshold and top-K
  -> build source-labelled context
  -> call selected LLM provider
  -> validate source citations
  -> return answer and source snippets
```

An empty retrieval result returns a no-answer response and does not invoke the LLM.

## Logging

Pino writes newline-delimited JSON logs to `server/data/app.log` by default.
The path can be overridden with `LOG_FILE`. The file is intentionally ignored
by Git because it contains local runtime history. `GET /api/logs` returns only
the latest bounded tail for the single-user diagnostics panel; it is not a
replacement for production log aggregation.

## Persistence

SQLite enables a zero-infrastructure local setup:

- `items`: source metadata, raw content, and ingestion lifecycle.
- `chunks`: ordered chunk text linked to an item.
- `embeddings`: serialized vectors and provider/model/dimension metadata.

Foreign keys are enabled and chunk/vector writes use a transaction. The database path is configurable through `DATABASE_PATH`.

## Provider selection

Embedding and generation providers are configured independently:

```text
EMBEDDING_PROVIDER=openai|gemini
LLM_PROVIDER=openai|gemini
```

This permits OpenAI embeddings with Gemini generation and the reverse. Query embeddings always come from the configured embedding provider/model, preventing incompatible vector comparisons.

## Scale boundary

The prototype's main scale boundary is the full SQLite vector scan on every question. A production version would move vectors to pgvector or a dedicated vector index, add hybrid keyword retrieval and reranking, and use durable workers for ingestion.
