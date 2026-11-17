import { useState } from "react";
import { Link2, Plus, X } from "lucide-react";
import { createUrl } from "../../services/api";

export function SaveUrlModal({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only HTTP and HTTPS URLs are allowed.");
      setSaving(true);
      setError(null);
      await createUrl(url);
      setUrl("");
      setOpen(false);
      await onCreated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save URL");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="button button-secondary" onClick={() => setOpen(true)}><Plus size={16} /> Save URL</button>
      {open && <div className="modal-backdrop" role="presentation">
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="url-title">
          <div className="modal-header"><div><Link2 size={18} /><h2 id="url-title">Save a URL</h2></div><button className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button></div>
          <label>Webpage URL<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/article" /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions"><button className="button button-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving} onClick={() => void submit()}>{saving ? "Saving..." : "Save URL"}</button></div>
        </section>
      </div>}
    </>
  );
}
