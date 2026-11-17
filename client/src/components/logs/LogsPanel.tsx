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
    <section className="logs-panel" id="logs">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Diagnostics</span>
          <h2>Application logs</h2>
        </div>
        <button className="button button-secondary" onClick={() => void refresh()}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      <p className="logs-description">
        Recent structured server events from the local log file. The file is
        excluded from Git and capped to the latest 100 lines here.
      </p>
      {error && <Feedback tone="error">{error}</Feedback>}
      {loading ? (
        <div className="loading-state">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <Terminal size={24} />
          <p>No log entries yet.</p>
        </div>
      ) : (
        <pre className="logs-output">{logs.join("\n")}</pre>
      )}
    </section>
  );
}
