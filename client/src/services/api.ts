import type { KnowledgeItem, QueryResult, SourceType } from "../types/api";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "The API request failed");
  }
  return body.data;
}

export function listItems(): Promise<{
  items: KnowledgeItem[];
  page: number;
  limit: number;
}> {
  return request("/items");
}

export function createNote(
  title: string,
  content: string,
): Promise<{ itemId: string; status: string }> {
  return request("/ingest", {
    method: "POST",
    body: JSON.stringify({ type: "NOTE", title, content }),
  });
}

export function createUrl(
  url: string,
): Promise<{ itemId: string; status: string }> {
  return request("/ingest", {
    method: "POST",
    body: JSON.stringify({ type: "URL", url }),
  });
}

export function queryKnowledge(question: string): Promise<QueryResult> {
  return request("/query", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export function getLogs(limit = 100): Promise<string[]> {
  return request<{ logs: string[] }>(`/logs?limit=${limit}`).then(
    (result) => result.logs,
  );
}

export function filterItems(
  items: KnowledgeItem[],
  sourceType?: SourceType,
): KnowledgeItem[] {
  return sourceType
    ? items.filter((item) => item.sourceType === sourceType)
    : items;
}
