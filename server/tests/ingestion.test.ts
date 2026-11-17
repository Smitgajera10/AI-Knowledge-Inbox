import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/database/database.js";
import { ChunkRepository } from "../src/database/repositories/chunk-repository.js";
import { ItemRepository } from "../src/database/repositories/item-repository.js";
import type { AIProvider } from "../src/services/ai/provider.js";
import { IngestionQueue } from "../src/workers/ingestion-queue.js";
import { IngestionWorker } from "../src/workers/ingestion-worker.js";

class MockProvider implements AIProvider {
  readonly name = "openai" as const;
  readonly embeddingModel = "mock-embedding";
  readonly chatModel = "mock-chat";

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => [text.length, 1]);
  }

  async generateAnswer(): Promise<string> {
    return "Mock answer";
  }
}

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("ingestion API", () => {
  it("accepts a note and processes it asynchronously", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-inbox-"));
    temporaryDirectories.push(directory);
    const database = createDatabase(path.join(directory, "test.db"));
    const items = new ItemRepository(database);
    const worker = new IngestionWorker(items, new ChunkRepository(database), new MockProvider());
    const queue = new IngestionQueue((itemId) => worker.process(itemId), 1, 1);
    const app = createApp({ items, ingestionQueue: queue });

    const response = await request(app).post("/api/ingest").send({
      type: "NOTE",
      title: "Redis",
      content: "Redis is an in-memory data store used for fast access."
    });

    expect(response.status).toBe(202);
    const itemId = response.body.data.itemId as string;
    await new Promise((resolve) => setTimeout(resolve, 50));

    const item = items.findById(itemId);
    expect(item?.status).toBe("COMPLETED");
    expect(database.prepare("SELECT COUNT(*) AS count FROM chunks WHERE item_id = ?").get(itemId)).toEqual({
      count: 1
    });

    await queue.shutdown();
    database.close();
  });

  it("rejects malformed ingestion payloads", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-inbox-"));
    temporaryDirectories.push(directory);
    const database = createDatabase(path.join(directory, "test.db"));
    const items = new ItemRepository(database);
    const queue = new IngestionQueue(async () => undefined);
    const app = createApp({ items, ingestionQueue: queue });

    const response = await request(app).post("/api/ingest").send({ type: "NOTE", title: "" });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    await queue.shutdown();
    database.close();
  });
});
