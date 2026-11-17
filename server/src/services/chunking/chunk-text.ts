export interface TextChunk {
  content: string;
  chunkIndex: number;
}

const DEFAULT_TARGET_CHARACTERS = 2_000;
const DEFAULT_OVERLAP_CHARACTERS = 300;

export function chunkText(
  input: string,
  targetCharacters = DEFAULT_TARGET_CHARACTERS,
  overlapCharacters = DEFAULT_OVERLAP_CHARACTERS
): TextChunk[] {
  const content = input.trim();
  if (!content) {
    return [];
  }
  if (targetCharacters <= 0 || overlapCharacters < 0 || overlapCharacters >= targetCharacters) {
    throw new Error("Chunk target must be positive and overlap must be smaller than target");
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < content.length) {
    let end = Math.min(start + targetCharacters, content.length);
    if (end < content.length) {
      const boundary = content.lastIndexOf(" ", end);
      if (boundary > start + Math.floor(targetCharacters * 0.6)) {
        end = boundary;
      }
    }

    const chunk = content.slice(start, end).trim();
    if (chunk) {
      chunks.push({ content: chunk, chunkIndex });
      chunkIndex += 1;
    }

    if (end >= content.length) {
      break;
    }
    start = Math.max(end - overlapCharacters, start + 1);
  }

  return chunks;
}
