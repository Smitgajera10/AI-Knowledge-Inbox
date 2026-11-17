import type Database from "better-sqlite3";
import type { Item, ItemStatus, SourceType } from "../../types/domain.js";

interface ItemRow {
  id: string;
  title: string;
  source_type: SourceType;
  source_url: string | null;
  raw_content: string;
  status: ItemStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    rawContent: row.raw_content,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ItemRepository {
  constructor(private readonly database: Database.Database) {}

  create(item: Item): void {
    this.database
      .prepare(
        `INSERT INTO items
          (id, title, source_type, source_url, raw_content, status, error_message, created_at, updated_at)
         VALUES (@id, @title, @sourceType, @sourceUrl, @rawContent, @status, @errorMessage, @createdAt, @updatedAt)`
      )
      .run({
        id: item.id,
        title: item.title,
        sourceType: item.sourceType,
        sourceUrl: item.sourceUrl,
        rawContent: item.rawContent,
        status: item.status,
        errorMessage: item.errorMessage,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
  }

  findById(id: string): Item | undefined {
    const row = this.database.prepare("SELECT * FROM items WHERE id = ?").get(id) as ItemRow | undefined;
    return row ? mapItem(row) : undefined;
  }

  updateStatus(id: string, status: ItemStatus, errorMessage: string | null = null): void {
    this.database
      .prepare(
        "UPDATE items SET status = @status, error_message = @errorMessage, updated_at = @updatedAt WHERE id = @id"
      )
      .run({ id, status, errorMessage, updatedAt: new Date().toISOString() });
  }

  list(limit: number, offset: number, status?: ItemStatus, sourceType?: SourceType): Item[] {
    const conditions: string[] = [];
    const parameters: Record<string, string | number> = { limit, offset };

    if (status) {
      conditions.push("status = @status");
      parameters.status = status;
    }
    if (sourceType) {
      conditions.push("source_type = @sourceType");
      parameters.sourceType = sourceType;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = this.database
      .prepare(`SELECT * FROM items ${where} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
      .all(parameters) as ItemRow[];
    return rows.map(mapItem);
  }
}
