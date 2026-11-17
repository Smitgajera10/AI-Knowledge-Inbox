import cors from "cors";
import express from "express";
import helmet from "helmet";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "256kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      success: true,
      data: { status: "ok", service: "ai-knowledge-inbox" }
    });
  });

  return app;
}
