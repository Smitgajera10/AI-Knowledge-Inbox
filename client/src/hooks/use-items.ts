import { useCallback, useEffect, useState } from "react";
import { listItems } from "../services/api";
import type { KnowledgeItem } from "../types/api";

export function useItems() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await listItems();
      setItems(data.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load knowledge");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!items.some((item) => item.status === "PENDING" || item.status === "PROCESSING")) {
      return;
    }
    const timer = window.setTimeout(() => void refresh(), 1500);
    return () => window.clearTimeout(timer);
  }, [items, refresh]);

  return { items, loading, error, refresh };
}
