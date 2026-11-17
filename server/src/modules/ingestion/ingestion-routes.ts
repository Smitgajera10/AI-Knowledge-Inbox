import { Router } from "express";
import type { ItemRepository } from "../../database/repositories/item-repository.js";
import type { IngestionQueue } from "../../workers/ingestion-queue.js";
import { createIngestionController } from "./ingestion-controller.js";

export function createIngestionRoutes(
  items: ItemRepository,
  queue: IngestionQueue,
): Router {
  const router = Router();
  router.post("/ingest", createIngestionController(items, queue));
  return router;
}
