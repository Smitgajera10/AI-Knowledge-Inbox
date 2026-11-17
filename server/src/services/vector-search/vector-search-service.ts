import type {
  SearchRepository,
  SearchRow,
} from "../../database/repositories/search-repository.js";
import type { AIProvider } from "../ai/provider.js";
import { cosineSimilarity } from "./cosine-similarity.js";

export interface SearchResult {
  chunkId: string;
  itemId: string;
  content: string;
  title: string;
  sourceUrl: string | null;
  similarity: number;
}

export class VectorSearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly embeddingProvider: AIProvider,
    private readonly topK: number,
    private readonly threshold: number,
  ) {}

  async search(question: string): Promise<SearchResult[]> {
    const [queryVector] = await this.embeddingProvider.embed([question]);
    if (!queryVector || queryVector.length === 0) {
      throw new Error("Question embedding was empty");
    }

    const rows = this.repository.listCompletedEmbeddings();
    const compatibleRows = rows.filter(
      (row) =>
        row.provider === this.embeddingProvider.name &&
        row.model === this.embeddingProvider.embeddingModel &&
        row.dimensions === queryVector.length &&
        row.vector.length === queryVector.length,
    );

    return compatibleRows
      .map((row) => this.score(row, queryVector))
      .filter((result) => result.similarity >= this.threshold)
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, this.topK);
  }

  private score(row: SearchRow, queryVector: number[]): SearchResult {
    return {
      chunkId: row.chunkId,
      itemId: row.itemId,
      content: row.content,
      title: row.title,
      sourceUrl: row.sourceUrl,
      similarity: cosineSimilarity(queryVector, row.vector),
    };
  }
}
