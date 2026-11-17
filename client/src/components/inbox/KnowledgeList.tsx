import { ExternalLink, FileText, Globe2 } from "lucide-react";
import type { KnowledgeItem } from "../../types/api";
import { StatusBadge } from "../common/StatusBadge";

export function KnowledgeList({ items }: { items: KnowledgeItem[] }) {
  if (items.length === 0) {
    return <div className="empty-state"><FileText size={26} /><h3>Your inbox is empty</h3><p>Add a note or save a URL to start building your knowledge base.</p></div>;
  }

  return <div className="knowledge-list">{items.map((item) => (
    <article className="knowledge-card" key={item.id}>
      <div className="card-icon">{item.sourceType === "URL" ? <Globe2 size={18} /> : <FileText size={18} />}</div>
      <div className="card-content"><div className="card-heading"><h3>{item.title}</h3><StatusBadge status={item.status} /></div><p>{item.status === "FAILED" ? item.errorMessage : item.rawContent || "Fetching and extracting webpage content..."}</p><small>{new Date(item.createdAt).toLocaleString()}{item.sourceUrl && <> · <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a></>}</small></div>
    </article>
  ))}</div>;
}
