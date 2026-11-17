import type { ItemStatus } from "../../types/api";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ${status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : status === "FAILED" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>{status}</span>
  );
}
