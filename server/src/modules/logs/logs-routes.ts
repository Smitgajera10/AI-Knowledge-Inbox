import { Router } from "express";
import { readRecentLogs } from "../../utils/logger.js";

export function createLogsRoutes(): Router {
  const router = Router();

  router.get("/logs", (request, response, next) => {
    try {
      const requestedLimit = Number(request.query.limit ?? 100);
      const logs = readRecentLogs(requestedLimit);
      response.status(200).json({
        success: true,
        data: {
          logs,
          count: logs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
