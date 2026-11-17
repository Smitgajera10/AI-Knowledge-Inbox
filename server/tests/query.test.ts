import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/database/database.js";
import { ItemRepository } from "../src/database/repositories/item-repository.js";
import type { AIProvider } from "../src/services/ai/provider.js";
import { RagService } from "../src/services/rag/rag-service.js";
import { SearchRepository } from "../src/database/repositories/search-repository.js";
import { VectorSearchService } from "../src/services/vector-search/vector-search-service.js";

class QueryProvider implements AIProvider {
  readonly name = "openai" as const;
  readonly embeddingModel = "mock-embedding";
  readonly chatModel = "mock-chat";
  private readonly chunkId: string;

  constructor(chunkId: string) {
    this.chunkId = chunkId;
  }

  async embed(): Promise<number[][]> {
    return [[1, 0]];
  }

  async generateAnswer(): Promise<string> {
    return `Redis is fast [source:${this.chunkId}]`;
  }
}

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("POST /api/query", () => {
  it("returns a grounded answer with retrieved sources", async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "knowledge-query-"),
    );
    temporaryDirectories.push(directory);
    const database = createDatabase(path.join(directory, "test.db"));
    const itemId = "item-1";
    const chunkId = "chunk-1";
    const now = new Date().toISOString();
    database
      .prepare(
        `INSERT INTO items
          (id, title, source_type, source_url, raw_content, status, error_message, created_at, updated_at)
         VALUES (?, ?, 'NOTE', NULL, ?, 'COMPLETED', NULL, ?, ?)`,
      )
      .run(
        itemId,
        "Redis notes",
        "Redis is an in-memory data store.",
        now,
        now,
      );
    database
      .prepare(
        "INSERT INTO chunks (id, item_id, content, chunk_index, created_at) VALUES (?, ?, ?, 0, ?)",
      )
      .run(chunkId, itemId, "Redis is an in-memory data store.", now);
    database
      .prepare(
        "INSERT INTO embeddings (id, chunk_id, vector, provider, model, dimensions, created_at) VALUES (?, ?, ?, 'openai', 'mock-embedding', 2, ?)",
      )
      .run("embedding-1", chunkId, JSON.stringify([1, 0]), now);

    const provider = new QueryProvider(chunkId);
    const search = new VectorSearchService(
      new SearchRepository(database),
      provider,
      5,
      0.1,
    );
    const app = createApp({
      items: new ItemRepository(database),
      rag: new RagService(search, provider),
    });

    const response = await request(app)
      .post("/api/query")
      .send({ question: "What is Redis?" });

    expect(response.status).toBe(200);
    expect(response.body.data.answer).toContain(`[source:${chunkId}]`);
    expect(response.body.data.sources[0]).toMatchObject({
      itemId,
      chunkId,
      title: "Redis notes",
    });
    database.close();
  });

  it("does not call the LLM when there is no relevant context", async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "knowledge-query-"),
    );
    temporaryDirectories.push(directory);
    const database = createDatabase(path.join(directory, "test.db"));
    const provider = new QueryProvider("missing");
    const search = new VectorSearchService(
      new SearchRepository(database),
      provider,
      5,
      0.1,
    );
    const app = createApp({ rag: new RagService(search, provider) });

    const response = await request(app)
      .post("/api/query")
      .send({ question: "Unknown" });

    expect(response.status).toBe(200);
    expect(response.body.data.sources).toEqual([]);
    expect(response.body.data.answer).toContain("could not find");
    database.close();
  });
});
