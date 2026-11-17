import type { ReactNode } from "react";

export function Feedback({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "error";
}) {
  return <div className={`my-3 rounded-lg px-3 py-2.5 text-sm ${tone === "error" ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-600"}`}>{children}</div>;
}
