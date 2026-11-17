import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      404,
      "NOT_FOUND",
      `Route not found: ${request.method} ${request.path}`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  const message =
    error instanceof AppError ? error.message : "An unexpected error occurred";

  if (statusCode >= 500) {
    logger.error({ err: error }, "Request failed");
  } else {
    logger.warn({ err: error }, "Request rejected");
  }

  response.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
