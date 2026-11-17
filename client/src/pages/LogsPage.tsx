import { LogsPanel } from "../components/logs/LogsPanel";

export function LogsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">Diagnostics</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Application logs</h1>
        <p className="mt-3 text-zinc-500">Inspect recent structured server events from the local log file.</p>
      </div>
      <LogsPanel />
    </main>
  );
}
