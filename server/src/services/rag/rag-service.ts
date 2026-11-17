import type { AIProvider } from "../ai/provider.js";
import type { SearchResult } from "../vector-search/vector-search-service.js";
import { buildContext } from "./context-builder.js";
import { validateCitations } from "./citation-validator.js";
import { VectorSearchService } from "../vector-search/vector-search-service.js";

export interface QueryResult {
  answer: string;
  sources: Array<{
    itemId: string;
    chunkId: string;
    title: string;
    snippet: string;
    similarity: number;
    sourceUrl: string | null;
  }>;
}

export class RagService {
  constructor(
    private readonly search: VectorSearchService,
    private readonly llmProvider: AIProvider
  ) {}

  async query(question: string): Promise<QueryResult> {
    const results = await this.search.search(question);
    if (results.length === 0) {
      return {
        answer: "I could not find relevant information in your saved knowledge.",
        sources: []
      };
    }

    const answer = await this.llmProvider.generateAnswer({
      question,
      context: buildContext(results)
    });
    const allowedChunkIds = new Set(results.map((result) => result.chunkId));
    if (!validateCitations(answer, allowedChunkIds)) {
      throw new Error("The generated answer did not contain valid source citations");
    }

    return {
      answer,
      sources: results.map((result) => ({
        itemId: result.itemId,
        chunkId: result.chunkId,
        title: result.title,
        snippet: result.content.slice(0, 300),
        similarity: result.similarity,
        sourceUrl: result.sourceUrl
      }))
    };
  }
}
