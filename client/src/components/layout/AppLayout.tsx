import { BookOpen, Inbox, MessageCircle, ScrollText } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-60 flex-col border-r border-zinc-200 bg-white p-5 max-md:w-16 max-md:px-2">
        <div className="flex items-center gap-2 px-2 pb-9 max-md:justify-center max-md:px-0">
          <div className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <BookOpen size={18} />
          </div>
          <div className="max-md:hidden">
            <strong className="block leading-tight text-zinc-900">Knowledge</strong>
            <span className="block text-xs leading-tight text-zinc-500">Inbox</span>
          </div>
        </div>
        <nav className="grid gap-1">
          <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-indigo-50 text-indigo-700" : "text-zinc-500 hover:bg-zinc-50"}`}>
            <Inbox size={17} /> <span className="max-md:hidden">Inbox</span>
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-indigo-50 text-indigo-700" : "text-zinc-500 hover:bg-zinc-50"}`}>
            <MessageCircle size={17} /> <span className="max-md:hidden">AI Assistant</span>
          </NavLink>
          <NavLink to="/logs" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-indigo-50 text-indigo-700" : "text-zinc-500 hover:bg-zinc-50"}`}>
            <ScrollText size={17} /> <span className="max-md:hidden">Logs</span>
          </NavLink>
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-zinc-400 max-md:hidden">
          Your private space for saved knowledge and grounded answers.
        </p>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
