import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { AppConfig } from "../../config/env.js";
import type { AIProvider } from "./provider.js";
import { GeminiProvider } from "./providers/gemini-provider.js";
import { OpenAIProvider } from "./providers/openai-provider.js";

export function createEmbeddingProvider(config: AppConfig): AIProvider {
  if (config.EMBEDDING_PROVIDER === "openai") {
    if (!config.OPENAI_API_KEY || !config.OPENAI_EMBEDDING_MODEL) {
      throw new Error("OpenAI embedding configuration is incomplete");
    }
    return new OpenAIProvider(
      new OpenAI({ apiKey: config.OPENAI_API_KEY, timeout: 30_000 }),
      config.OPENAI_EMBEDDING_MODEL,
      config.OPENAI_CHAT_MODEL ?? ""
    );
  }

  if (!config.GEMINI_API_KEY || !config.GEMINI_EMBEDDING_MODEL) {
    throw new Error("Gemini embedding configuration is incomplete");
  }
  return new GeminiProvider(
    new GoogleGenAI({ apiKey: config.GEMINI_API_KEY }),
    config.GEMINI_EMBEDDING_MODEL,
    config.GEMINI_CHAT_MODEL ?? ""
  );
}

export function createLlmProvider(config: AppConfig): AIProvider {
  if (config.LLM_PROVIDER === "openai") {
    if (!config.OPENAI_API_KEY || !config.OPENAI_CHAT_MODEL) {
      throw new Error("OpenAI LLM configuration is incomplete");
    }
    return new OpenAIProvider(
      new OpenAI({ apiKey: config.OPENAI_API_KEY, timeout: 30_000 }),
      config.OPENAI_EMBEDDING_MODEL ?? "",
      config.OPENAI_CHAT_MODEL
    );
  }

  if (!config.GEMINI_API_KEY || !config.GEMINI_CHAT_MODEL) {
    throw new Error("Gemini LLM configuration is incomplete");
  }
  return new GeminiProvider(
    new GoogleGenAI({ apiKey: config.GEMINI_API_KEY }),
    config.GEMINI_EMBEDDING_MODEL ?? "",
    config.GEMINI_CHAT_MODEL
  );
}
