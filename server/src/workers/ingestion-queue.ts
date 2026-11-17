import { logger } from "../utils/logger.js";

type JobProcessor = (itemId: string) => Promise<void>;

export class IngestionQueue {
  private readonly pending: string[] = [];
  private readonly queued = new Set<string>();
  private activeJobs = 0;
  private stopped = false;

  constructor(
    private readonly processor: JobProcessor,
    private readonly concurrency = 2,
    private readonly maxAttempts = 3,
  ) {}

  enqueue(itemId: string): void {
    if (this.stopped || this.queued.has(itemId)) {
      return;
    }

    this.pending.push(itemId);
    this.queued.add(itemId);
    this.drain();
  }

  async shutdown(): Promise<void> {
    this.stopped = true;
    while (this.activeJobs > 0) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  private drain(): void {
    while (
      !this.stopped &&
      this.activeJobs < this.concurrency &&
      this.pending.length > 0
    ) {
      const itemId = this.pending.shift()!;
      this.activeJobs += 1;
      void this.run(itemId);
    }
  }

  private async run(itemId: string): Promise<void> {
    try {
      for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
        try {
          await this.processor(itemId);
          return;
        } catch (error) {
          if (attempt === this.maxAttempts) {
            logger.error(
              { err: error, itemId, attempts: attempt },
              "Ingestion job failed",
            );
            return;
          }
          const delay = 250 * 2 ** (attempt - 1);
          logger.warn(
            { err: error, itemId, attempt, retryInMs: delay },
            "Retrying ingestion job",
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } finally {
      this.queued.delete(itemId);
      this.activeJobs -= 1;
      this.drain();
    }
  }
}
