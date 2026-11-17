import { BookOpen, Inbox, MessageCircle, ScrollText, Settings } from "lucide-react";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BookOpen size={18} />
          </div>
          <div>
            <strong>Knowledge</strong>
            <span>Inbox</span>
          </div>
        </div>
        <nav>
          <a className="nav-item active" href="#inbox">
            <Inbox size={17} /> Inbox
          </a>
          <a className="nav-item" href="#assistant">
            <MessageCircle size={17} /> AI Assistant
          </a>
          <a className="nav-item" href="#settings">
            <Settings size={17} /> Settings
          </a>
          <a className="nav-item" href="#logs">
            <ScrollText size={17} /> Logs
          </a>
        </nav>
        <p className="sidebar-note">
          Your private space for saved knowledge and grounded answers.
        </p>
      </aside>
      <div className="content-shell">{children}</div>
    </div>
  );
}
