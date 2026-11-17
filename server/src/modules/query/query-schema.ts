import { z } from "zod";

export const querySchema = z.object({
  question: z.string().trim().min(1).max(2_000)
});
