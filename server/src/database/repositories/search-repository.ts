import type Database from "better-sqlite3";

export interface SearchRow {
  chunkId: string;
  itemId: string;
  content: string;
  title: string;
  sourceUrl: string | null;
  vector: number[];
  provider: string;
  model: string;
  dimensions: number;
}

interface SearchDatabaseRow {
  chunk_id: string;
  item_id: string;
  content: string;
  title: string;
  source_url: string | null;
  vector: string;
  provider: string;
  model: string;
  dimensions: number;
}

export class SearchRepository {
  constructor(private readonly database: Database.Database) {}

  listCompletedEmbeddings(): SearchRow[] {
    const rows = this.database
      .prepare(
        `SELECT c.id AS chunk_id, c.item_id, c.content, i.title, i.source_url,
                e.vector, e.provider, e.model, e.dimensions
         FROM chunks c
         JOIN items i ON i.id = c.item_id
         JOIN embeddings e ON e.chunk_id = c.id
         WHERE i.status = 'COMPLETED'
         ORDER BY c.created_at ASC`
      )
      .all() as SearchDatabaseRow[];

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      itemId: row.item_id,
      content: row.content,
      title: row.title,
      sourceUrl: row.source_url,
      vector: JSON.parse(row.vector) as number[],
      provider: row.provider,
      model: row.model,
      dimensions: row.dimensions
    }));
  }
}
