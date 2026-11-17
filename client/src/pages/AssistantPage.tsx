import { ChatPanel } from "../components/chat/ChatPanel";
import { useItems } from "../hooks/use-items";

export function AssistantPage() {
  const { items } = useItems();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-12">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">AI assistant</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Ask your knowledge base</h1>
        <p className="mt-3 text-zinc-500">Answers are grounded in your saved notes and webpages.</p>
      </div>
      <ChatPanel hasKnowledge={items.some((item) => item.status === "COMPLETED")} />
    </main>
  );
}
