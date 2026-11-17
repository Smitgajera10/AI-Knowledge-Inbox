import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { logger } from "./utils/logger.js";
import type { ItemRepository } from "./database/repositories/item-repository.js";
import type { IngestionQueue } from "./workers/ingestion-queue.js";
import { createIngestionRoutes } from "./modules/ingestion/ingestion-routes.js";
import { createItemsRoutes } from "./modules/items/items-routes.js";
import type { RagService } from "./services/rag/rag-service.js";
import { createQueryRoutes } from "./modules/query/query-routes.js";
import { createLogsRoutes } from "./modules/logs/logs-routes.js";

export interface AppDependencies {
  items?: ItemRepository;
  ingestionQueue?: IngestionQueue;
  rag?: RagService;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }),
  );
  app.use(express.json({ limit: "256kb" }));
  app.use(pinoHttp({ logger }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      success: true,
      data: { status: "ok", service: "ai-knowledge-inbox" },
    });
  });
  app.use("/api", createLogsRoutes());

  if (dependencies.items && dependencies.ingestionQueue) {
    app.use(
      "/api",
      createIngestionRoutes(dependencies.items, dependencies.ingestionQueue),
    );
    app.use("/api", createItemsRoutes(dependencies.items));
  }
  if (dependencies.rag) {
    app.use("/api", createQueryRoutes(dependencies.rag));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
