import { ExternalLink, FileText, Globe2 } from "lucide-react";
import type { KnowledgeItem } from "../../types/api";
import { StatusBadge } from "../common/StatusBadge";

export function KnowledgeList({ items }: { items: KnowledgeItem[] }) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-2 py-12 text-center text-zinc-400">
        <FileText size={26} />
        <h3 className="text-sm font-semibold text-zinc-600">Your inbox is empty</h3>
        <p className="text-sm">Add a note or save a URL to start building your knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <article className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4" key={item.id}>
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-500">
            {item.sourceType === "URL" ? (
              <Globe2 size={18} />
            ) : (
              <FileText size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-semibold text-zinc-900">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-500">
              {item.status === "FAILED"
                ? item.errorMessage
                : item.rawContent ||
                  "Fetching and extracting webpage content..."}
            </p>
            <small className="text-xs text-zinc-400">
              {new Date(item.createdAt).toLocaleString()}
              {item.sourceUrl && (
                <>
                  {" "}
                  ·{" "}
                  <a className="inline-flex items-center gap-1 text-indigo-500" href={item.sourceUrl} target="_blank" rel="noreferrer">
                    Open source <ExternalLink size={12} />
                  </a>
                </>
              )}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}
