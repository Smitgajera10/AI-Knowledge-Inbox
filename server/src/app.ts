import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { logger } from "./utils/logger.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "256kb" }));
  app.use(pinoHttp({ logger }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      success: true,
      data: { status: "ok", service: "ai-knowledge-inbox" }
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
