import type { ReactNode } from "react";

export function Feedback({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "error" }) {
  return <div className={`feedback feedback-${tone}`}>{children}</div>;
}
