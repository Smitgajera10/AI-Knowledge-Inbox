import { describe, expect, it } from "vitest";
import { chunkText } from "../src/services/chunking/chunk-text.js";

describe("chunkText", () => {
  it("returns no chunks for empty content", () => {
    expect(chunkText("   ")).toEqual([]);
  });

  it("preserves content order and overlap for long content", () => {
    const content = Array.from({ length: 20 }, (_, index) => `word-${index}`).join(" ");
    const chunks = chunkText(content, 40, 10);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.chunkIndex).toBe(0);
    expect(chunks[1]?.chunkIndex).toBe(1);
    expect(chunks[0]?.content.split(" ").some((word) => chunks[1]?.content.includes(word))).toBe(true);
  });

  it("supports Unicode content", () => {
    expect(chunkText("ज्ञान संग्रहण 🚀", 10, 2).every((chunk) => chunk.content.length > 0)).toBe(true);
  });
});
