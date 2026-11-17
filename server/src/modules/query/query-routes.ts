import { Router } from "express";
import type { RagService } from "../../services/rag/rag-service.js";
import { createQueryController } from "./query-controller.js";

export function createQueryRoutes(rag: RagService): Router {
  const router = Router();
  router.post("/query", createQueryController(rag));
  return router;
}
