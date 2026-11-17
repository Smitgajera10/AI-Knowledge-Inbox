import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Terminal } from "lucide-react";
import { getLogs } from "../../services/api";
import { Feedback } from "../common/Feedback";

export function LogsPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLogs(await getLogs(100));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not load logs",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7" id="logs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">Diagnostics</span>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">Application logs</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-400" onClick={() => void refresh()}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Recent structured server events from the local log file. The file is
        excluded from Git and capped to the latest 100 lines here.
      </p>
      {error && <Feedback tone="error">{error}</Feedback>}
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-400">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="grid place-items-center gap-2 py-12 text-center text-sm text-zinc-400">
          <Terminal size={24} />
          <p>No log entries yet.</p>
        </div>
      ) : (
        <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-300">{logs.join("\n")}</pre>
      )}
    </section>
  );
}
