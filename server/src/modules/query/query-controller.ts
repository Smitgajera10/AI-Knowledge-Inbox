import type { RequestHandler } from "express";
import { AppError } from "../../middleware/error-handler.js";
import type { RagService } from "../../services/rag/rag-service.js";
import { querySchema } from "./query-schema.js";

export function createQueryController(rag: RagService): RequestHandler {
  return async (request, response, next) => {
    const parsed = querySchema.safeParse(request.body);
    if (!parsed.success) {
      next(
        new AppError(
          422,
          "INVALID_QUERY_REQUEST",
          parsed.error.issues[0]?.message ?? "Invalid question",
        ),
      );
      return;
    }

    try {
      const result = await rag.query(parsed.data.question);
      response.status(200).json({ success: true, data: result });
    } catch (error) {
      next(
        new AppError(
          502,
          "QUERY_PROVIDER_ERROR",
          error instanceof Error ? error.message : "Query failed",
        ),
      );
    }
  };
}
