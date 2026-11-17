export interface AIProvider {
  readonly name: "openai" | "gemini";
  readonly embeddingModel: string;
  readonly chatModel: string;
  embed(texts: string[]): Promise<number[][]>;
  generateAnswer(params: { question: string; context: string }): Promise<string>;
}
