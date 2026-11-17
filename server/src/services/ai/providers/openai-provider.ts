import OpenAI from "openai";
import type { AIProvider } from "../provider.js";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;

  constructor(
    private readonly client: OpenAI,
    readonly embeddingModel: string,
    readonly chatModel: string
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: texts
    });

    const vectors = response.data
      .sort((left, right) => left.index - right.index)
      .map((embedding) => embedding.embedding);

    if (vectors.length !== texts.length || vectors.some((vector) => vector.length === 0)) {
      throw new Error("OpenAI returned an invalid embedding response");
    }

    return vectors;
  }

  async generateAnswer(params: { question: string; context: string }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.chatModel,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Answer only from the supplied context. Cite source identifiers from the context. If the context does not answer the question, say so plainly."
        },
        {
          role: "user",
          content: `Question: ${params.question}\n\nContext:\n${params.context}`
        }
      ]
    });

    const answer = response.choices[0]?.message.content?.trim();
    if (!answer) {
      throw new Error("OpenAI returned an empty answer");
    }

    return answer;
  }
}
