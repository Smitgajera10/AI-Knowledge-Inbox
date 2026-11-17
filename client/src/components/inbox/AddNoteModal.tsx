import { useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { createNote } from "../../services/api";

export function AddNoteModal({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
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
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save note",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add note
      </button>
      {open && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-zinc-950/30 p-5" role="presentation">
          <section
            className="grid w-full max-w-lg gap-4 rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-title"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText size={18} />
                <h2 id="note-title">Add a note</h2>
              </div>
              <button className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Redis notes"
              />
            </label>
            <label>
              Content
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the knowledge you want to retrieve later..."
                rows={8}
              />
            </label>
            {error && <p             className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={saving}
                onClick={() => void submit()}
              >
                {saving ? "Saving..." : "Save note"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
