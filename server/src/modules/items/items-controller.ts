import type { RequestHandler } from "express";
import { AppError } from "../../middleware/error-handler.js";
import type { ItemRepository } from "../../database/repositories/item-repository.js";
import { ITEM_STATUSES, SOURCE_TYPES } from "../../types/domain.js";

export function createItemsController(items: ItemRepository): {
  list: RequestHandler;
  detail: RequestHandler;
} {
  return {
    list: (request, response, next) => {
      try {
        const page = Math.max(Number(request.query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(request.query.limit ?? 20), 1), 100);
        const status = request.query.status;
        const sourceType = request.query.sourceType;
        if (status && !ITEM_STATUSES.includes(status as (typeof ITEM_STATUSES)[number])) {
          throw new AppError(422, "INVALID_STATUS", "Invalid item status filter");
        }
        if (sourceType && !SOURCE_TYPES.includes(sourceType as (typeof SOURCE_TYPES)[number])) {
          throw new AppError(422, "INVALID_SOURCE_TYPE", "Invalid source type filter");
        }
        const data = items.list(
          limit,
          (page - 1) * limit,
          status as (typeof ITEM_STATUSES)[number] | undefined,
          sourceType as (typeof SOURCE_TYPES)[number] | undefined
        );
        response.status(200).json({ success: true, data: { items: data, page, limit } });
      } catch (error) {
        next(error);
      }
    },
    detail: (request, response, next) => {
      const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      const item = items.findById(id);
      if (!item) {
        next(new AppError(404, "ITEM_NOT_FOUND", "Knowledge item was not found"));
        return;
      }
      response.status(200).json({ success: true, data: item });
    }
  };
}
