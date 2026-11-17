
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

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        onClick={() => setOpen(true)}
      >
        <Plus size={17} />
        Add note
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <section
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h2
                    id="note-title"
                    className="text-base font-semibold text-zinc-900"
                  >
                    Add a note
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Save something important for later.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="grid size-9 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 px-6 py-6">
              <div className="space-y-2">
                <label
                  htmlFor="note-name"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Note title
                </label>

                <input
                  id="note-name"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Redis notes"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="note-content"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Content
                </label>

                <textarea
                  id="note-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write the knowledge you want to retrieve later..."
                  rows={8}
                  className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <p className="text-right text-xs text-zinc-400">
                  {content.length} characters
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/70 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void submit()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
