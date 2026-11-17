import { useState } from "react";
import { Link2, Plus, X } from "lucide-react";
import { createUrl } from "../../services/api";

export function SaveUrlModal({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol))
        throw new Error("Only HTTP and HTTPS URLs are allowed.");
      setSaving(true);
      setError(null);
      await createUrl(url);
      setUrl("");
      setOpen(false);
      await onCreated();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save URL",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} /> Save URL
      </button>
      {open && (
        <div
          className="fixed inset-0 z-10 grid place-items-center bg-zinc-950/30 p-5"
          role="presentation"
        >
          <section
            className="grid w-full max-w-lg gap-4 rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="url-title"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Link2 size={18} />
                <h2 id="url-title">Save a URL</h2>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-600">
              Webpage URL
              <div className="flex items-center rounded-lg border border-zinc-300 px-3 py-2 w-full justify-between transition-all duration-200 hover:border-indigo-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 ">
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
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
                {saving ? "Saving..." : "Save URL"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
