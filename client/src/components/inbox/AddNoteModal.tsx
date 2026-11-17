import { useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { createNote } from "../../services/api";

export function AddNoteModal({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await createNote(title, content);
      setTitle("");
      setContent("");
      setOpen(false);
      await onCreated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="button button-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add note</button>
      {open && <div className="modal-backdrop" role="presentation">
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="note-title">
          <div className="modal-header"><div><FileText size={18} /><h2 id="note-title">Add a note</h2></div><button className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button></div>
          <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Redis notes" /></label>
          <label>Content<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write the knowledge you want to retrieve later..." rows={8} /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions"><button className="button button-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving} onClick={() => void submit()}>{saving ? "Saving..." : "Save note"}</button></div>
        </section>
      </div>}
    </>
  );
}
