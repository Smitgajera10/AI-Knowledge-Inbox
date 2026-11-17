import type Database from "better-sqlite3";
import type { Chunk, StoredEmbedding } from "../../types/domain.js";

export class ChunkRepository {
  constructor(private readonly database: Database.Database) {}

  replaceForItem(
    itemId: string,
    chunks: Array<Chunk & { embedding: StoredEmbedding }>,
  ): void {
    const transaction = this.database.transaction(() => {
      this.database.prepare("DELETE FROM chunks WHERE item_id = ?").run(itemId);

      const insertChunk = this.database.prepare(
        `INSERT INTO chunks (id, item_id, content, chunk_index, created_at)
         VALUES (@id, @itemId, @content, @chunkIndex, @createdAt)`,
      );
      const insertEmbedding = this.database.prepare(
        `INSERT INTO embeddings
          (id, chunk_id, vector, provider, model, dimensions, created_at)
         VALUES (@id, @chunkId, @vector, @provider, @model, @dimensions, @createdAt)`,
      );

      for (const chunk of chunks) {
        insertChunk.run({
          id: chunk.id,
          itemId: chunk.itemId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          createdAt: chunk.createdAt,
        });
        insertEmbedding.run({
          id: chunk.embedding.id,
          chunkId: chunk.embedding.chunkId,
          vector: JSON.stringify(chunk.embedding.vector),
          provider: chunk.embedding.provider,
          model: chunk.embedding.model,
          dimensions: chunk.embedding.dimensions,
          createdAt: chunk.embedding.createdAt,
        });
      }
    });

    transaction();
  }
}
