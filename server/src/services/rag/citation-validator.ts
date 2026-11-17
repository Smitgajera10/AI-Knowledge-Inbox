const citationPattern = /\[source:([a-zA-Z0-9-]+)\]/g;

export function validateCitations(answer: string, allowedChunkIds: Set<string>): boolean {
  const citations = [...answer.matchAll(citationPattern)].map((match) => match[1]);
  return citations.length > 0 && citations.every((citation) => allowedChunkIds.has(citation));
}
