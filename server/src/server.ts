import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { createDatabase } from "./database/database.js";
import { ChunkRepository } from "./database/repositories/chunk-repository.js";
import { ItemRepository } from "./database/repositories/item-repository.js";
import { createEmbeddingProvider } from "./services/ai/provider-factory.js";
import { IngestionQueue } from "./workers/ingestion-queue.js";
import { IngestionWorker } from "./workers/ingestion-worker.js";

const config = loadConfig();
const database = createDatabase(config.DATABASE_PATH);
const items = new ItemRepository(database);
const chunks = new ChunkRepository(database);
const embeddings = createEmbeddingProvider(config);
const worker = new IngestionWorker(items, chunks, embeddings);
const ingestionQueue = new IngestionQueue((itemId) => worker.process(itemId));
const app = createApp({ items, ingestionQueue });

const server = app.listen(config.PORT, () => {
  console.log(`AI Knowledge Inbox API listening on http://localhost:${config.PORT}`);
});

function shutdown(signal: string): void {
  console.log(`Received ${signal}; shutting down`);
  void ingestionQueue.shutdown().then(() => {
    database.close();
    server.close((error) => {
      if (error) {
        console.error("Failed to close server cleanly", error);
        process.exitCode = 1;
      }
    });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
