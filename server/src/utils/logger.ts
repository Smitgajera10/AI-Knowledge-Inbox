import pino from "pino";
import fs from "node:fs";
import path from "node:path";

const defaultLogFile = path.basename(process.cwd()) === "server"
  ? path.join(process.cwd(), "data", "app.log")
  : path.join(process.cwd(), "server", "data", "app.log");

export const logFilePath = path.resolve(process.env.LOG_FILE ?? defaultLogFile);
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

export const logger = pino(
  {
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "*.apiKey",
    "*.api_key",
  ],
  },
  pino.destination({ dest: logFilePath, mkdir: true, sync: false }),
);

export function readRecentLogs(limit = 100): string[] {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error("Log limit must be between 1 and 500");
  }

  if (!fs.existsSync(logFilePath)) {
    return [];
  }

  const content = fs.readFileSync(logFilePath, "utf8");
  return content.split(/\r?\n/).filter(Boolean).slice(-limit);
}
