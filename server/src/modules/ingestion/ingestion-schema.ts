import { z } from "zod";

const baseSchema = z.object({
  type: z.enum(["NOTE", "URL"]),
});

export const ingestionSchema = z.discriminatedUnion("type", [
  baseSchema.extend({
    type: z.literal("NOTE"),
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(100_000),
  }),
  baseSchema.extend({
    type: z.literal("URL"),
    url: z.string().url().max(2_000),
  }),
]);

export type IngestionInput = z.infer<typeof ingestionSchema>;
