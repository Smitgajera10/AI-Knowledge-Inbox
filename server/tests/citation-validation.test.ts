import { describe, expect, it } from "vitest";
import { validateCitations } from "../src/services/rag/citation-validator.js";

describe("validateCitations", () => {
  it("accepts citations from retrieved chunks", () => {
    expect(validateCitations("Redis is fast [source:chunk-1].", new Set(["chunk-1"]))).toBe(true);
  });

  it("rejects missing or unknown citations", () => {
    expect(validateCitations("Redis is fast.", new Set(["chunk-1"]))).toBe(false);
    expect(validateCitations("Redis is fast [source:other].", new Set(["chunk-1"]))).toBe(false);
  });
});
