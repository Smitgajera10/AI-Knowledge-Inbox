import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("GET /api/logs", () => {
  it("returns a bounded structured log tail", async () => {
    const response = await request(createApp()).get("/api/logs?limit=10");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.logs)).toBe(true);
    expect(response.body.data.logs.length).toBeLessThanOrEqual(10);
  });
});
