import type { SearchResult } from "../vector-search/vector-search-service.js";

export function buildContext(results: SearchResult[]): string {
  return results
    .map(
      (result) =>
        `[source:${result.chunkId}] ${result.title}${result.sourceUrl ? ` (${result.sourceUrl})` : ""}\n${result.content}`,
    )
    .join("\n\n");
}
