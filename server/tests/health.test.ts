import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /api/health", () => {
  it("returns an API health response", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok", service: "ai-knowledge-inbox" }
    });
  });
});
