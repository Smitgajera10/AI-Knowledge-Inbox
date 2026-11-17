export const SOURCE_TYPES = ["NOTE", "URL"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ITEM_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface Item {
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

export interface Chunk {
  id: string;
  itemId: string;
  content: string;
  chunkIndex: number;
  createdAt: string;
}

export interface StoredEmbedding {
  id: string;
  chunkId: string;
  vector: number[];
  provider: string;
  model: string;
  dimensions: number;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
