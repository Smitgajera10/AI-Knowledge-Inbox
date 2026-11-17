import { z } from "zod";

const providerSchema = z.enum(["openai", "gemini"]);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_PATH: z.string().min(1).default("./data/knowledge-inbox.db"),
  EMBEDDING_PROVIDER: providerSchema.default("gemini"),
  LLM_PROVIDER: providerSchema.default("gemini"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_EMBEDDING_MODEL: z.string().optional(),
  GEMINI_CHAT_MODEL: z.string().optional(),
  TOP_K: z.coerce.number().int().min(1).max(25).default(5),
  SIMILARITY_THRESHOLD: z.coerce.number().min(-1).max(1).default(0.25),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration: ${result.error.message}`,
    );
  }

  return result.data;
}

export function assertProviderConfiguration(config: AppConfig): void {
  const providers = new Set([config.EMBEDDING_PROVIDER, config.LLM_PROVIDER]);

  for (const provider of providers) {
    const key =
      provider === "openai" ? config.OPENAI_API_KEY : config.GEMINI_API_KEY;
    if (!key) {
      throw new Error(`Missing API key for configured ${provider} provider`);
    }
  }
}
