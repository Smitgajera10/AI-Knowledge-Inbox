import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../../middleware/error-handler.js";
import type { ItemRepository } from "../../database/repositories/item-repository.js";
import { ingestionSchema } from "./ingestion-schema.js";
import type { IngestionQueue } from "../../workers/ingestion-queue.js";

export function createIngestionController(
  items: ItemRepository,
  queue: IngestionQueue,
): RequestHandler {
  return (request, response, next) => {
    const parsed = ingestionSchema.safeParse(request.body);
    if (!parsed.success) {
      next(
        new AppError(
          422,
          "INVALID_INGESTION_REQUEST",
          parsed.error.issues[0]?.message ?? "Invalid request",
        ),
      );
      return;
    }

    const input = parsed.data;
    const itemId = crypto.randomUUID();
    const now = new Date().toISOString();
    const isNote = input.type === "NOTE";
    items.create({
      id: itemId,
      title: isNote ? input.title : new URL(input.url).hostname,
      sourceType: input.type,
      sourceUrl: isNote ? null : input.url,
      rawContent: isNote ? input.content : "",
      status: "PENDING",
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
    queue.enqueue(itemId);

    response.status(202).json({
      success: true,
      data: { itemId, status: "PENDING" },
    });
  };
}
