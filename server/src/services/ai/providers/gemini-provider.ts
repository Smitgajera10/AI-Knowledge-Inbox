import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "../provider.js";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;

  constructor(
    private readonly client: GoogleGenAI,
    readonly embeddingModel: string,
    readonly chatModel: string
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.models.embedContent({
      model: this.embeddingModel,
      contents: texts
    });
    const vectors = (response.embeddings ?? []).map((embedding) => embedding.values ?? []);

    if (vectors.length !== texts.length || vectors.some((vector) => vector.length === 0)) {
      throw new Error("Gemini returned an invalid embedding response");
    }

    return vectors;
  }

  async generateAnswer(params: { question: string; context: string }): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.chatModel,
      contents: `Answer only from the supplied context. Cite source identifiers from the context. If the context does not answer the question, say so plainly.\n\nQuestion: ${params.question}\n\nContext:\n${params.context}`
    });

    const answer = response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!answer) {
      throw new Error("Gemini returned an empty answer");
    }

    return answer;
  }
}
