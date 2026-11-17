export type SourceType = "NOTE" | "URL";
export type ItemStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface KnowledgeItem {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  rawContent: string;
  status: ItemStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SourceCitation {
  itemId: string;
  chunkId: string;
  title: string;
  snippet: string;
  similarity: number;
  sourceUrl: string | null;
}

export interface QueryResult {
  answer: string;
  sources: SourceCitation[];
}
