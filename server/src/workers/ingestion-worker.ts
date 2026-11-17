import crypto from "node:crypto";
import type { ChunkRepository } from "../database/repositories/chunk-repository.js";
import type { ItemRepository } from "../database/repositories/item-repository.js";
import type { AIProvider } from "../services/ai/provider.js";
import { chunkText } from "../services/chunking/chunk-text.js";
import { extractWebPage } from "../services/extraction/web-extractor.js";
import { logger } from "../utils/logger.js";

export class IngestionWorker {
  constructor(
    private readonly items: ItemRepository,
    private readonly chunks: ChunkRepository,
    private readonly embeddingProvider: AIProvider
  ) {}

  async process(itemId: string): Promise<void> {
    const item = this.items.findById(itemId);
    if (!item) {
      throw new Error(`Ingestion item ${itemId} was not found`);
    }

    this.items.updateStatus(itemId, "PROCESSING");

    try {
      let title = item.title;
      let content = item.rawContent;
      let sourceUrl = item.sourceUrl;

      if (item.sourceType === "URL") {
        const page = await extractWebPage(item.sourceUrl ?? item.rawContent);
        title = page.title;
        content = page.content;
        sourceUrl = page.sourceUrl;
        this.items.updateContent(itemId, title, content, sourceUrl);
      }

      const textChunks = chunkText(content);
      if (textChunks.length === 0) {
        throw new Error("Content did not produce any non-empty chunks");
      }

      const vectors = await this.embeddingProvider.embed(textChunks.map((chunk) => chunk.content));
      if (vectors.length !== textChunks.length || vectors.some((vector) => vector.length === 0)) {
        throw new Error("Embedding provider returned an invalid vector set");
      }

      const now = new Date().toISOString();
      this.chunks.replaceForItem(
        itemId,
        textChunks.map((chunk, index) => {
          const vector = vectors[index];
          return {
            id: crypto.randomUUID(),
            itemId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            createdAt: now,
            embedding: {
              id: crypto.randomUUID(),
              chunkId: "",
              vector,
              provider: this.embeddingProvider.name,
              model: this.embeddingProvider.embeddingModel,
              dimensions: vector.length,
              createdAt: now
            }
          };
        }).map((chunk) => ({
          ...chunk,
          embedding: { ...chunk.embedding, chunkId: chunk.id }
        }))
      );
      this.items.updateStatus(itemId, "COMPLETED");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ingestion failed";
      this.items.updateStatus(itemId, "FAILED", message.slice(0, 500));
      logger.error({ err: error, itemId }, "Ingestion processing failed");
      throw error;
    }
  }
}
