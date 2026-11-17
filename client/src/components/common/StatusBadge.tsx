import type { ItemStatus } from "../../types/api";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}
