import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "../src/services/vector-search/cosine-similarity.js";

describe("cosineSimilarity", () => {
  it("calculates similarity for compatible vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("returns zero for zero vectors", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("rejects dimension mismatches", () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow("different dimensions");
  });
});
