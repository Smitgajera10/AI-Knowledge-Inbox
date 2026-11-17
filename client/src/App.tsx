import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "./components/layout/AppLayout";
import { ChatPanel } from "./components/chat/ChatPanel";
import { Feedback } from "./components/common/Feedback";
import { AddNoteModal } from "./components/inbox/AddNoteModal";
import { KnowledgeList } from "./components/inbox/KnowledgeList";
import { SaveUrlModal } from "./components/inbox/SaveUrlModal";
import { useItems } from "./hooks/use-items";

export function App() {
  const { items, loading, error, refresh } = useItems();
  const [search, setSearch] = useState("");
  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.rawContent}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );
  const completedCount = items.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  return (
    <AppLayout>
      <main className="main-content" id="inbox">
        <header className="page-header">
          <div>
            <span className="eyebrow">Your workspace</span>
            <h1>Good morning, knowledge builder.</h1>
            <p>Capture ideas and make them searchable with AI.</p>
          </div>
          <div className="header-actions">
            <AddNoteModal onCreated={refresh} />
            <SaveUrlModal onCreated={refresh} />
          </div>
        </header>
        <section className="inbox-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Knowledge inbox</span>
              <h2>Everything you saved</h2>
            </div>
            <span className="item-count">{items.length} items</span>
          </div>
          <div className="search-bar">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your inbox..."
            />
          </div>
          {error && <Feedback tone="error">{error}</Feedback>}
          {loading ? (
            <div className="loading-state">Loading your knowledge...</div>
          ) : (
            <KnowledgeList items={visibleItems} />
          )}
        </section>
        <ChatPanel hasKnowledge={completedCount > 0} />
      </main>
    </AppLayout>
  );
}
