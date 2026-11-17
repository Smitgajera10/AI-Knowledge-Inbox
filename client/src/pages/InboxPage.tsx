import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Feedback } from "../components/common/Feedback";
import { AddNoteModal } from "../components/inbox/AddNoteModal";
import { KnowledgeList } from "../components/inbox/KnowledgeList";
import { SaveUrlModal } from "../components/inbox/SaveUrlModal";
import { useItems } from "../hooks/use-items";

export function InboxPage() {
  const { items, loading, error, refresh } = useItems();
  const [search, setSearch] = useState("");
  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.rawContent}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">Your workspace</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Good morning, knowledge builder.</h1>
          <p className="mt-3 text-zinc-500">Capture ideas and make them searchable with AI.</p>
        </div>
        <div className="flex gap-2">
          <AddNoteModal onCreated={refresh} />
          <SaveUrlModal onCreated={refresh} />
        </div>
      </header>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">Knowledge inbox</span>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">Everything you saved</h2>
          </div>
          <span className="text-xs text-zinc-500">{items.length} items</span>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 text-zinc-400">
          <Search size={17} />
          <input className="w-full border-0 bg-transparent py-3 text-sm text-zinc-900 outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your inbox..." />
        </div>
        {error && <Feedback tone="error">{error}</Feedback>}
        {loading ? <div className="py-12 text-center text-sm text-zinc-400">Loading your knowledge...</div> : <KnowledgeList items={visibleItems} />}
      </section>
    </main>
  );
}
